import React, { useState, useEffect, useRef } from "react";

interface ScoreMeterProps {
  targetScore: number;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({ targetScore }) => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Soft animation tick for rating gauge
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScore((prev) => {
        if (prev < targetScore) {
          return Math.min(prev + 2, targetScore);
        } else if (prev > targetScore) {
          return Math.max(prev - 2, targetScore);
        }
        return prev;
      });
    }, 16);
    return () => clearInterval(timer);
  }, [targetScore]);

  // Redraw circular canvas ScoreMeter
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const x = width / 2;
    const y = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    // Outer Background Track
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.75 * Math.PI, 2.25 * Math.PI);
    ctx.strokeStyle = "#1C2128";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Determine color code based on compliance thresholds
    let gaugeColor = "#F85149"; // Critical (Red)
    if (currentScore >= 70) {
      gaugeColor = "#3FB950"; // Pass (Green)
    } else if (currentScore >= 40) {
      gaugeColor = "#D29922"; // Warn (Amber)
    }

    // Process arc ratio
    if (currentScore > 0) {
      const percentage = currentScore / 100;
      const startAngle = 0.75 * Math.PI;
      const endAngle = startAngle + (1.5 * Math.PI * percentage);

      ctx.beginPath();
      ctx.arc(x, y, radius, startAngle, endAngle);
      ctx.strokeStyle = gaugeColor;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();

      // Soft layout glow ring
      ctx.beginPath();
      ctx.arc(x, y, radius - 8, startAngle, endAngle);
      ctx.strokeStyle = gaugeColor + "15";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Compliance Score Value
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px 'Segoe UI', Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${currentScore}%`, x, y - 5);

    ctx.fillStyle = "#8B949E";
    ctx.font = "bold 10px 'Segoe UI', Inter, sans-serif";
    ctx.fillText("OVERALL SCORE", x, y + 18);
  }, [currentScore]);

  return (
    <div className="md:col-span-4 bg-[#121620] border border-[#21262D] rounded-2xl p-4 flex flex-col items-center justify-center text-center relative shadow-lg h-56 select-none hover:border-blue-500/20 transition-all duration-300">
      <canvas
        ref={canvasRef}
        width={180}
        height={130}
        className="mb-1"
        id="score_meter_canvas"
      />
      <div className="flex gap-2 text-[10px] mt-1 text-[#8B949E] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3FB950]" /> &ge;70 Pass
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D29922]" /> 40-69 Warn
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F85149]" /> &lt;40 Fail
        </span>
      </div>
    </div>
  );
};
