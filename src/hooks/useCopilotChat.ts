import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../components/ChatCopilot";
import { AuditItem } from "../types";

export const useCopilotChat = (activeAudit: AuditItem | null) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatAttachedImage, setChatAttachedImage] = useState<string | null>(null);
  const [chatAttachedImageMime, setChatAttachedImageMime] = useState<string | null>(null);
  const chatImageInputRef = useRef<HTMLInputElement>(null);

  // Helper to trigger chatbot welcome message on active audit change
  useEffect(() => {
    if (activeAudit) {
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          text: `👋 Hello! I am your **Interactive Medical Audit Copilot** for **${
            activeAudit.fileName || "this patient"
          }**. 

I have fully ingested and analyzed this medical record (Compliance Score: **${
            activeAudit.complianceScore
          }/100**, Verdict: **${
            activeAudit.verdict || (activeAudit.complianceScore >= 70 ? "PASS" : "FLAGGED")
          }**).

Here are some ways I can help you:
- Explain specific score deductions or mistakes in the documentation.
- Break down the clinical negligence findings or upcoding evidence.
- Answer general medical doubts, therapeutic guidelines, and recommend standard medicines/remedies for common conditions (such as common cold, persistent cough, seasonal flu, etc.).
- Review any supplementary images, charts, or clinical records you attach!

Select one of the quick prompts below or type your custom query.`,
        },
      ]);
      setChatAttachedImage(null);
      setChatAttachedImageMime(null);
    } else {
      setChatMessages([
        {
          id: "welcome-none",
          role: "assistant",
          text: `👋 Welcome to the Interactive Medical Copilot!

I am ready to assist you:
1. Select or execute an audit in the main workspace to review specific clinical cases.
2. Or ask me directly about any **general medical doubts, conditions, or clinical guidelines**—such as what supportive therapies, over-the-counter (OTC) options, or remedies are standard for common ailments like the **common cold, cough, seasonal flu, fever**, etc.

How can I help you today?`,
        },
      ]);
    }
  }, [activeAudit?.id]);

  const handleChatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setChatAttachedImage(event.target.result);
          setChatAttachedImageMime(mime);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendChatMessage = async (presetText?: string) => {
    const messageToSend = presetText || chatInput;
    if (!messageToSend.trim() && !chatAttachedImage) return;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: messageToSend,
      image: chatAttachedImage || undefined,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const imageToSend = chatAttachedImage
      ? {
          data: chatAttachedImage.split(",")[1] || chatAttachedImage,
          mimeType: chatAttachedImageMime || "image/jpeg",
        }
      : undefined;

    // Reset attached image
    setChatAttachedImage(null);
    setChatAttachedImageMime(null);

    try {
      // Map history for the model
      const history = chatMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          history,
          activeAuditId: activeAudit?.id,
          image: imageToSend,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate copilot reply");
      }

      const data = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant_${Date.now()}`,
          role: "assistant",
          text: data.response || "No reply text received.",
        },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant_err_${Date.now()}`,
          role: "assistant",
          text: `❌ **Error connecting to Audit Copilot:** ${err.message || "Unknown communication failure."}`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const removeAttachedImage = () => {
    setChatAttachedImage(null);
    setChatAttachedImageMime(null);
  };

  return {
    chatMessages,
    chatInput,
    setChatInput,
    chatLoading,
    chatAttachedImage,
    chatImageInputRef,
    handleChatImageChange,
    handleSendChatMessage,
    removeAttachedImage,
  };
};
