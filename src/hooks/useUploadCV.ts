import { fileApi } from "@/services/api";
import { useUploadStore } from "@/storage";
import { useCallback, useState } from "react";

// ==================== UPLOAD HOOKS ====================
export const useUploadCV = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addUpload } = useUploadStore();

  const uploadCV = useCallback(
    async (file: File, jobRequirementId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fileApi.uploadCV(file, jobRequirementId);
        addUpload(result);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Upload failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addUpload]
  );

  const uploadMultipleCV = useCallback(
    async (files: File[], jobRequirementId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fileApi.uploadMultipleCV(files, jobRequirementId);
        result.results.forEach((upload) => addUpload(upload));
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Batch upload failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addUpload]
  );

  return { uploadCV, uploadMultipleCV, isLoading, error };
};