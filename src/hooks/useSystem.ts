import { useCallback, useState } from 'react';
import { systemApi } from '@/services/api';

export const useSystem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const healthCheck = useCallback(async () => {
    try {
      return await systemApi.healthCheck();
    } catch (err: any) {
      setError(err.message || 'Health check failed');
      throw err;
    }
  }, []);

  const getStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await systemApi.getStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { healthCheck, getStats, isLoading, error };
};