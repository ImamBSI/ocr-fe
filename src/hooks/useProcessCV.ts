import { cvApi } from "@/services/api";
import { useCandidateStore } from "@/storage";
import type { Candidate } from "@/types";
import { useCallback, useState } from "react";

// ==================== CV PROCESSING HOOKS ====================
export const useProcessCV = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCandidate, setCandidates } = useCandidateStore();

  const processCV = useCallback(
    async (fileId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await cvApi.processCV(fileId);
        if (result.status === 'success') {
          // Convert ProcessCVResponse to Candidate
          const candidate: Candidate = {
            ...result,
            cv_text: result.cv_text,
            file_path: '',
            file_name: '',
            score: 0,
            matched_criteria: {},
            created_at: new Date().toISOString(),
          };
          addCandidate(candidate);
        }
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Processing failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addCandidate]
  );

  const processBatch = useCallback(
    async (fileIds: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await cvApi.processBatch(fileIds);
        setCandidates(result.candidates);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Batch processing failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setCandidates]
  );

  const listCVs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cvApi.listCVs();
      setCandidates(result.items);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch CVs';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setCandidates]);

  return { processCV, processBatch, listCVs, isLoading, error };
};