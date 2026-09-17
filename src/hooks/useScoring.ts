import { useCallback, useState } from 'react';
import { scoringApi } from '@/services/api';
import { useCandidateStore, useScoringStore } from '@/storage';

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

  return { scoreCandidate, scoreBatch, getRankedCandidates, isLoading, error };
};