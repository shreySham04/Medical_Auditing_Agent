import { useState } from "react";
import { auditService } from "../services/auditService";

export const useGoogleReviewDraft = () => {
  const [googleReviewDraft, setGoogleReviewDraft] = useState<string>("");
  const [isGeneratingGoogleReview, setIsGeneratingGoogleReview] = useState<boolean>(false);
  const [googleReviewError, setGoogleReviewError] = useState<string>("");
  const [googleReviewSource, setGoogleReviewSource] = useState<string>("");
  const [showGoogleReviewPublishSandbox, setShowGoogleReviewPublishSandbox] = useState<boolean>(false);

  const generateDraft = async (auditId: string, department: string) => {
    try {
      setIsGeneratingGoogleReview(true);
      setGoogleReviewError("");
      const result = await auditService.draftGoogleReview(auditId, department);
      if (result.success && result.draft) {
        setGoogleReviewDraft(result.draft);
        setGoogleReviewSource("GEMINI_AI_AGENT");
      } else {
        throw new Error(result.error || "Failed to generate safety draft");
      }
    } catch (e: any) {
      setGoogleReviewError(e.message || "Failed to compile safety draft.");
      setGoogleReviewDraft("");
    } finally {
      setIsGeneratingGoogleReview(false);
    }
  };

  const resetDraft = () => {
    setGoogleReviewDraft("");
    setGoogleReviewError("");
    setGoogleReviewSource("");
    setShowGoogleReviewPublishSandbox(false);
  };

  return {
    googleReviewDraft,
    setGoogleReviewDraft,
    isGeneratingGoogleReview,
    googleReviewError,
    googleReviewSource,
    showGoogleReviewPublishSandbox,
    setShowGoogleReviewPublishSandbox,
    generateDraft,
    resetDraft,
  };
};
