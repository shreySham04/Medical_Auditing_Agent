#!/usr/bin/env python3
import json
import math
import random
import time

def load_and_preprocess(filepath="data/training_samples.json"):
    print(f"[*] Loading Kaggle Medical Audit Reports Dataset ({filepath})...")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"[+] Loaded {len(data):,} patient clinical records.")
    
    # Extract numerical & categorical feature vectors directly
    topic_list = ["Cardiology", "Neurology", "Emergency", "Orthopedics", "Oncology", "Internal Medicine", "Pediatrics", "Pulmonology"]
    topic_map = {t: i for i, t in enumerate(topic_list)}
    
    verdict_map = {"Pass": 0, "Flagged": 1, "Failed": 2}
    
    X = []
    y_score = []      # Continuous score 0-1
    y_upcode = []     # 0 or 1
    y_deviation = []  # 0 or 1
    y_verdict = []    # 0, 1, 2
    
    for item in data:
        # Features:
        # 1-8: One-hot topic
        topic_vec = [0.0] * len(topic_list)
        t_idx = topic_map.get(item.get("topic", "Cardiology"), 0)
        topic_vec[t_idx] = 1.0
        
        # 9: Upcoding indicator
        upcode_flag = 1.0 if item.get("upcodingDetected") else 0.0
        # 10: Deviation indicator
        dev_flag = 1.0 if item.get("clinicalDeviation") else 0.0
        # 11: Risk classification
        risk = item.get("riskClassification", "Medium")
        risk_val = 0.0 if risk == "Low" else (0.5 if risk == "Medium" else (0.8 if risk == "High" else 1.0))
        # 12: Billed length / presence of CPT
        cpt_len = len(item.get("cptBilled", "")) / 50.0
        # 13: Ground score normalized
        score_val = float(item.get("complianceScore", 70)) / 100.0
        # 14: Target verdict
        v_idx = verdict_map.get(item.get("verdict", "Flagged"), 1)
        
        # Compose input feature vector
        feat = topic_vec + [upcode_flag, dev_flag, risk_val, cpt_len]
        X.append(feat)
        y_score.append(score_val)
        y_upcode.append(upcode_flag)
        y_deviation.append(dev_flag)
        y_verdict.append(v_idx)
        
    return X, y_score, y_upcode, y_deviation, y_verdict

class FastMultiTaskModel:
    def __init__(self, n_in=12, n_hidden=24):
        self.n_in = n_in
        self.n_hidden = n_hidden
        
        random.seed(42)
        s1 = math.sqrt(2.0 / n_in)
        self.W1 = [[random.gauss(0, s1) for _ in range(n_hidden)] for _ in range(n_in)]
        self.b1 = [0.0] * n_hidden
        
        s2 = math.sqrt(2.0 / n_hidden)
        self.W_score = [random.gauss(0, s2) for _ in range(n_hidden)]
        self.b_score = 0.5
        
        self.W_upcode = [random.gauss(0, s2) for _ in range(n_hidden)]
        self.b_upcode = 0.0
        
        self.W_dev = [random.gauss(0, s2) for _ in range(n_hidden)]
        self.b_dev = 0.0
        
        self.W_v = [[random.gauss(0, s2) for _ in range(3)] for _ in range(n_hidden)]
        self.b_v = [0.0, 0.0, 0.0]

    def sigmoid(self, x):
        return 1.0 / (1.0 + math.exp(-max(-15.0, min(15.0, x))))

    def softmax(self, arr):
        m = max(arr)
        exps = [math.exp(x - m) for x in arr]
        s = sum(exps)
        return [e / s for e in exps]

    def forward(self, x):
        h = [self.b1[j] + sum(x[i] * self.W1[i][j] for i in range(self.n_in)) for j in range(self.n_hidden)]
        # ReLU
        h_act = [v if v > 0 else 0.01 * v for v in h]
        
        p_score = self.sigmoid(self.b_score + sum(h_act[j] * self.W_score[j] for j in range(self.n_hidden)))
        p_upcode = self.sigmoid(self.b_upcode + sum(h_act[j] * self.W_upcode[j] for j in range(self.n_hidden)))
        p_dev = self.sigmoid(self.b_dev + sum(h_act[j] * self.W_dev[j] for j in range(self.n_hidden)))
        
        v_logits = [self.b_v[c] + sum(h_act[j] * self.W_v[j][c] for j in range(self.n_hidden)) for c in range(3)]
        p_v = self.softmax(v_logits)
        
        return h_act, p_score, p_upcode, p_dev, p_v

    def train_epoch(self, X, y_score, y_upcode, y_dev, y_v, lr=0.04):
        total_loss = 0.0
        n = len(X)
        eps = 1e-7
        indices = list(range(n))
        random.shuffle(indices)
        
        for idx in indices:
            x = X[idx]
            t_score = y_score[idx]
            t_upcode = y_upcode[idx]
            t_dev = y_dev[idx]
            t_v = y_v[idx]
            
            h, p_s, p_u, p_d, p_v = self.forward(x)
            
            # Loss calculations
            l_score = (p_s - t_score) ** 2
            l_upcode = -(t_upcode * math.log(p_u + eps) + (1.0 - t_upcode) * math.log(1.0 - p_u + eps))
            l_dev = -(t_dev * math.log(p_d + eps) + (1.0 - t_dev) * math.log(1.0 - p_d + eps))
            l_v = -math.log(p_v[t_v] + eps)
            
            loss = l_score + 0.4 * l_upcode + 0.4 * l_dev + 0.6 * l_v
            total_loss += loss
            
            # Gradients
            d_s = 2.0 * (p_s - t_score) * (p_s * (1.0 - p_s))
            d_u = 0.4 * (p_u - t_upcode)
            d_d = 0.4 * (p_d - t_dev)
            
            d_v = [0.6 * (p_v[c] - (1.0 if c == t_v else 0.0)) for c in range(3)]
            
            dh = [
                d_s * self.W_score[j] + d_u * self.W_upcode[j] + d_d * self.W_dev[j] + sum(d_v[c] * self.W_v[j][c] for c in range(3))
                for j in range(self.n_hidden)
            ]
            
            # Update heads
            for j in range(self.n_hidden):
                self.W_score[j] -= lr * d_s * h[j]
                self.W_upcode[j] -= lr * d_u * h[j]
                self.W_dev[j] -= lr * d_d * h[j]
                for c in range(3):
                    self.W_v[j][c] -= lr * d_v[c] * h[j]
                    
            self.b_score -= lr * d_s
            self.b_upcode -= lr * d_u
            self.b_dev -= lr * d_d
            for c in range(3):
                self.b_v[c] -= lr * d_v[c]
                
            # Update Layer 1
            for j in range(self.n_hidden):
                d_pre = dh[j] * (1.0 if h[j] > 0 else 0.01)
                self.b1[j] -= lr * d_pre
                for i in range(self.n_in):
                    self.W1[i][j] -= lr * d_pre * x[i]
                    
        return total_loss / n

    def evaluate(self, X, y_score, y_upcode, y_dev, y_v):
        total_loss = 0.0
        score_mae = 0.0
        upcode_acc = 0
        v_acc = 0
        n = len(X)
        eps = 1e-7
        
        for idx in range(n):
            x = X[idx]
            t_s = y_score[idx]
            t_u = y_upcode[idx]
            t_d = y_dev[idx]
            t_v = y_v[idx]
            
            _, p_s, p_u, p_d, p_v = self.forward(x)
            
            l_score = (p_s - t_s) ** 2
            l_u = -(t_u * math.log(p_u + eps) + (1.0 - t_u) * math.log(1.0 - p_u + eps))
            l_d = -(t_d * math.log(p_d + eps) + (1.0 - t_d) * math.log(1.0 - p_d + eps))
            l_v = -math.log(p_v[t_v] + eps)
            
            total_loss += (l_score + 0.4 * l_u + 0.4 * l_d + 0.6 * l_v)
            score_mae += abs(p_s * 100.0 - t_s * 100.0)
            
            if (p_u >= 0.5) == (t_u == 1.0):
                upcode_acc += 1
            if max(range(3), key=lambda c: p_v[c]) == t_v:
                v_acc += 1
                
        return total_loss / n, score_mae / n, (upcode_acc / n) * 100.0, (v_acc / n) * 100.0

def main():
    X, y_score, y_upcode, y_dev, y_v = load_and_preprocess()
    
    # 8,000 Train / 2,000 Validation
    split = 8000
    X_train, X_val = X[:split], X[split:]
    ys_train, ys_val = y_score[:split], y_score[split:]
    yu_train, yu_val = y_upcode[:split], y_upcode[split:]
    yd_train, yd_val = y_dev[:split], y_dev[split:]
    yv_train, yv_val = y_v[:split], y_v[split:]
    
    print(f"\n[+] Partitioned: {len(X_train):,} Train Records | {len(X_val):,} Validation Records")
    print(f"[+] Training Model for 5 Epochs on Kaggle Dataset...\n")
    print("-" * 88)
    print(f"{'Epoch':<8}{'Detected Train Loss':<24}{'Validation Loss':<20}{'Score MAE (pts)':<18}{'Verdict Acc (%)':<15}")
    print("-" * 88)
    
    model = FastMultiTaskModel(n_in=len(X[0]), n_hidden=24)
    epochs = 5
    history = []
    
    t0 = time.time()
    for ep in range(1, epochs + 1):
        lr = 0.045 * (0.88 ** (ep - 1))
        train_loss = model.train_epoch(X_train, ys_train, yu_train, yd_train, yv_train, lr=lr)
        val_loss, score_mae, up_acc, v_acc = model.evaluate(X_val, ys_val, yu_val, yd_val, yv_val)
        
        row = {
            "epoch": ep,
            "train_loss": round(train_loss, 5),
            "val_loss": round(val_loss, 5),
            "score_mae": round(score_mae, 2),
            "upcoding_accuracy": round(up_acc, 2),
            "verdict_accuracy": round(v_acc, 2)
        }
        history.append(row)
        print(f"Epoch {ep:<3}/5 | Train Loss: {train_loss:<10.5f} | Val Loss: {val_loss:<10.5f} | MAE: {score_mae:>5.2f} pts   | Verdict Acc: {v_acc:>5.2f}%")
        
    duration = time.time() - t0
    print("-" * 88)
    print(f"[✓] 5-Epoch Training Finished in {duration:.2f}s.")
    print(f"[✓] Initial Loss (Epoch 1): {history[0]['train_loss']:.5f} --> Final Detected Loss (Epoch 5): {history[-1]['train_loss']:.5f}\n")
    
    result = {
        "dataset": "Kaggle Medical Audit Dataset (10,000 Samples)",
        "epochs": epochs,
        "history": history,
        "final_train_loss": history[-1]["train_loss"],
        "final_val_loss": history[-1]["val_loss"],
        "final_verdict_accuracy": history[-1]["verdict_accuracy"],
        "final_upcoding_accuracy": history[-1]["upcoding_accuracy"],
    }
    
    with open("data/training_metrics.json", "w") as f:
        json.dump(result, f, indent=2)
        
    print("[+] Results stored in 'data/training_metrics.json'")

if __name__ == "__main__":
    main()
