import { useState, useEffect } from "react";
import { auditService } from "../services/auditService";

export const useApiStatus = () => {
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [checkingApi, setCheckingApi] = useState<boolean>(true);

  const checkStatus = async () => {
    try {
      setCheckingApi(true);
      const data = await auditService.getStatus();
      setIsApiReady(data.apiReady);
    } catch (e) {
      console.error("API error status query:", e);
      setIsApiReady(false);
    } finally {
      setCheckingApi(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return { isApiReady, checkingApi, checkStatus };
};
