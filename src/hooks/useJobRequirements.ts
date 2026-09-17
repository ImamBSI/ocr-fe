import { useCallback, useState } from 'react';
import { jobApi } from '@/services/api';
import { useJobStore } from '@/storage';
import type { JobRequirement } from '@/types';

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
      setError(err.response?.data?.detail || 'Failed to fetch jobs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setJobs]);

  const createJob = useCallback(async (data: Omit<JobRequirement, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await jobApi.createJobRequirement(data);
      addJob(result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create job');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addJob]);

  const updateJobRequirement = useCallback(async (jobId: string, data: Partial<JobRequirement>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await jobApi.updateJobRequirement(jobId, data);
      updateJob(jobId, result);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update job');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateJob]);

  const deleteJobRequirement = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await jobApi.deleteJobRequirement(jobId);
      removeJob(jobId);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete job');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [removeJob]);

  return { fetchJobs, createJob, updateJobRequirement, deleteJobRequirement, isLoading, error };
};