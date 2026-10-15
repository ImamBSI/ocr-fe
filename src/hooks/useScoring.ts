import { useCallback, useState } from 'react';
import { cvApi, scoringApi } from '@/services/api';
import { useCandidateStore, useScoringStore } from '@/storage';
import type { Candidate } from '@/types';

export const useScoring = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setScoredCandidates } = useScoringStore();
  const { candidates } = useCandidateStore();

  const scoreCandidate = useCallback(async (candidateId: string, jobRequirementId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await scoringApi.scoreCandidate(candidateId, jobRequirementId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Scoring failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scoreBatch = useCallback(async (candidateIds: string[], jobRequirementId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scoringApi.scoreBatch(candidateIds, jobRequirementId);
      const scoredCandidates = candidates.map((candidate) => {
        const scoreResult = result.results.find((item) => item.candidate_id === candidate.id);
        return scoreResult
          ? { ...candidate, score: scoreResult.score, matched_criteria: scoreResult.matched_criteria, ranking: scoreResult.rank }
          : candidate;
      });
      setScoredCandidates(scoredCandidates);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Batch scoring failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [candidates, setScoredCandidates]);

  const getRankedCandidates = useCallback(async (jobRequirementId: string, limit: number = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scoringApi.getRankedCandidates(jobRequirementId, { limit });
      setScoredCandidates(result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch ranked candidates');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setScoredCandidates]);

  /** Ambil semua kandidat pelamar untuk satu job (tanpa peduli sudah di-score atau belum). */
  const listCandidatesByJob = useCallback(async (jobRequirementId: string): Promise<Candidate[]> => {
    const result = await cvApi.listCVs({
      page: 1,
      page_size: 100,
      job_requirement_id: jobRequirementId,
    });
    return result.items;
  }, []);

  /** Score semua pelamar satu job, lalu ambil ranking resmi dari server. */
  const scoreAllForJob = useCallback(async (jobRequirementId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const applicants = await listCandidatesByJob(jobRequirementId);
      const ids = applicants.map((c) => c.id);
      if (ids.length > 0) {
        await scoringApi.scoreBatch(ids, jobRequirementId);
      }
      const ranked = await scoringApi.getRankedCandidates(jobRequirementId, { limit: 100 });
      setScoredCandidates(ranked);
      return { scored: ids.length, ranked };
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to score applicants');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listCandidatesByJob, setScoredCandidates]);

  return {
    scoreCandidate,
    scoreBatch,
    getRankedCandidates,
    listCandidatesByJob,
    scoreAllForJob,
    isLoading,
    error,
  };
};
