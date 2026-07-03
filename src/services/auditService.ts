import { AuditItem, StatusResponse } from "../types";

export interface AuditPayload {
  fileName: string;
  fileType: string;
  fileData: string;
  fileSize: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalName: string;
  department: string;
}

export const auditService = {
  async getStatus(): Promise<StatusResponse> {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error("Failed to fetch API status");
    return res.json();
  },

  async getAudits(): Promise<AuditItem[]> {
    const res = await fetch("/api/audits");
    if (!res.ok) throw new Error("Failed to load historical audits");
    return res.json();
  },

  async runAudit(payload: AuditPayload): Promise<{ success: boolean; audit?: AuditItem; error?: string }> {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Audit service timeout or network error");
    }
    return res.json();
  },

  async pollActiveStatus(): Promise<{ stage: string; message: string }> {
    const res = await fetch("/api/audit/status");
    if (!res.ok) throw new Error("Failed to poll active audit status");
    return res.json();
  },

  async deleteAudit(id: string): Promise<boolean> {
    const res = await fetch(`/api/audits/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete audit record");
    const data = await res.json();
    return data.success;
  },

  async draftGoogleReview(auditId: string, department: string): Promise<{ success: boolean; draft?: string; error?: string }> {
    const res = await fetch(`/api/audits/${auditId}/draft-google-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department }),
    });
    if (!res.ok) throw new Error("Failed to draft review");
    return res.json();
  },

  async supervisorRecheck(auditId: string): Promise<{ success: boolean; audit?: AuditItem; error?: string }> {
    const res = await fetch(`/api/audits/${auditId}/supervisor-recheck`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to run supervisor audit recheck");
    const data = await res.json();
    return {
      success: data.success,
      audit: data.audit || data.updatedAudit,
      error: data.error,
    };
  },

  async publishReview(auditId: string, reviewText: string, stars: number): Promise<{ success: boolean; reviewUrl?: string; error?: string }> {
    const res = await fetch(`/api/audits/${auditId}/publish-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewText, stars }),
    });
    if (!res.ok) throw new Error("Failed to publish Google review draft");
    return res.json();
  },

  async updateAuditStatus(auditId: string, status: 'REGISTERED' | 'DISMISSED' | 'SAVED FOR REVIEW' | 'PENDING USER APPROVAL'): Promise<{ success: boolean; audit?: AuditItem }> {
    const res = await fetch(`/api/audits/${auditId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update audit complaint status");
    const data = await res.json();
    return {
      success: data.success,
      audit: data.audit || data.updatedAudit,
    };
  },

  async lookupDoctor(name: string, dept: string): Promise<any> {
    const res = await fetch("/api/lookup-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        department: dept,
        doctorName: name,
        specialization: dept
      }),
    });
    if (!res.ok) throw new Error("Failed to lookup doctor credentials");
    return res.json();
  },

  async lookupHospital(name: string): Promise<any> {
    const res = await fetch("/api/lookup-hospital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name,
        hospitalName: name
      }),
    });
    if (!res.ok) throw new Error("Failed to lookup hospital compliance history");
    return res.json();
  },

  async chat(history: any[], userMessage: string, image?: { data: string; mimeType: string }): Promise<{ reply: string }> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, message: userMessage, image }),
    });
    if (!res.ok) throw new Error("Chat copilot service error");
    return res.json();
  }
};
