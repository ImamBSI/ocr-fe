import { useState, useCallback } from 'react';
import {
  fileApi,
  cvApi,
  scoringApi,
  jobApi,
  systemApi,
} from '../services/api';
import {
  useCandidateStore,
  useScoringStore,
  useJobStore,
  useUploadStore,
} from '../store';
import type{ Candidate, JobRequirement, ScoringCriteria } from '../types';

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

// ==================== SCORING HOOKS ====================
export const useScoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setScoredCandidates } = useScoringStore();
  const { candidates } = useCandidateStore();

  const scoreCandidate = useCallback(
    async (candidateId: string, jobRequirementId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await scoringApi.scoreCandidate(
          candidateId,
          jobRequirementId
        );
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Scoring failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const scoreBatch = useCallback(
    async (candidateIds: string[], jobRequirementId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await scoringApi.scoreBatch(
          candidateIds,
          jobRequirementId
        );

        // Update candidates with scores
        const scoredCandidates = candidates.map((candidate) => {
          const scoreResult = result.results.find(
            (r) => r.candidate_id === candidate.id
          );
          if (scoreResult) {
            return {
              ...candidate,
              score: scoreResult.score,
              matched_criteria: scoreResult.matched_criteria,
              ranking: scoreResult.rank,
            };
          }
          return candidate;
        });

        setScoredCandidates(scoredCandidates);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Batch scoring failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [candidates, setScoredCandidates]
  );

  const getRankedCandidates = useCallback(
    async (jobRequirementId: string, limit: number = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await scoringApi.getRankedCandidates(jobRequirementId, {
          limit,
        });
        setScoredCandidates(result);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.detail || 'Failed to fetch ranked candidates';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setScoredCandidates]
  );

  return {
    scoreCandidate,
    scoreBatch,
    getRankedCandidates,
    isLoading,
    error,
  };
};

// ==================== JOB REQUIREMENT HOOKS ====================
export const useJobRequirements = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setJobs, addJob, updateJob, removeJob } = useJobStore();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await jobApi.listJobRequirements();
      setJobs(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch jobs';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setJobs]);

  const createJob = useCallback(
    async (data: Omit<JobRequirement, 'id' | 'created_at' | 'updated_at'>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await jobApi.createJobRequirement(data);
        addJob(result);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Failed to create job';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addJob]
  );

  const updateJobRequirement = useCallback(
    async (jobId: string, data: Partial<JobRequirement>) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await jobApi.updateJobRequirement(jobId, data);
        updateJob(jobId, result);
        return result;
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Failed to update job';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateJob]
  );

  const deleteJobRequirement = useCallback(
    async (jobId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await jobApi.deleteJobRequirement(jobId);
        removeJob(jobId);
      } catch (err: any) {
        const message = err.response?.data?.detail || 'Failed to delete job';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [removeJob]
  );

  return {
    fetchJobs,
    createJob,
    updateJobRequirement,
    deleteJobRequirement,
    isLoading,
    error,
  };
};

// ==================== SYSTEM HOOKS ====================
export const useSystem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const healthCheck = useCallback(async () => {
    try {
      const result = await systemApi.healthCheck();
      return result;
    } catch (err: any) {
      const message = err.message || 'Health check failed';
      setError(message);
      throw err;
    }
  }, []);

  const getStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await systemApi.getStats();
      return result;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to fetch stats';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { healthCheck, getStats, isLoading, error };
};