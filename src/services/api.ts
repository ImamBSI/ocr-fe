import axios, { type AxiosInstance } from 'axios';
import type {
  Candidate,
  UploadResponse,
  ProcessCVResponse,
  ScoreResponse,
  BatchProcessResponse,
  PaginationParams,
  PaginatedResponse,
  JobRequirement,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Bisa tambahkan token auth di sini kalau perlu
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized');
    }
    return Promise.reject(error);
  }
);

// ==================== FILE UPLOAD ====================
export const fileApi = {
  /**
   * Upload CV file (DOCX atau PDF)
   */
  uploadCV: async (file: File, jobRequirementId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobRequirementId) {
      formData.append('job_requirement_id', jobRequirementId);
    }

    const response = await axiosInstance.post<UploadResponse>(
      '/api/upload/cv',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload multiple CV files
   */
  uploadMultipleCV: async (files: File[], jobRequirementId?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (jobRequirementId) {
      formData.append('job_requirement_id', jobRequirementId);
    }

    const response = await axiosInstance.post<{
      total: number;
      uploaded: number;
      failed: number;
      results: UploadResponse[];
    }>('/api/upload/cv-batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get upload status
   */
  getUploadStatus: async (uploadId: string) => {
    const response = await axiosInstance.get<UploadResponse>(
      `/api/upload/${encodeURIComponent(uploadId)}/status`
    );
    return response.data;
  },
};

// ==================== CV PROCESSING ====================
export const cvApi = {
  /**
   * Process CV - OCR + Extract Data
   */
  processCV: async (fileId: string) => {
    const response = await axiosInstance.post<ProcessCVResponse>(
      `/api/cv/${encodeURIComponent(fileId)}/process`
    );
    return response.data;
  },

  /**
   * Process multiple CVs in batch
   */
  processBatch: async (fileIds: string[]) => {
    const response = await axiosInstance.post<BatchProcessResponse>(
      '/api/cv/batch/process',
      { file_ids: fileIds }
    );
    return response.data;
  },

  /**
   * Get processed CV data
   */
  getCV: async (candidateId: string) => {
    const response = await axiosInstance.get<Candidate>(
      `/api/cv/${encodeURIComponent(candidateId)}`
    );
    return response.data;
  },

  /**
   * List all processed CVs
   */
  listCVs: async (params?: PaginationParams) => {
    const response = await axiosInstance.get<PaginatedResponse<Candidate>>(
      '/api/cv/list',
      { params }
    );
    return response.data;
  },

  /**
   * Delete CV
   */
  deleteCV: async (candidateId: string) => {
    const response = await axiosInstance.delete(`/api/cv/${encodeURIComponent(candidateId)}`);
    return response.data;
  },
};

// ==================== SCORING ====================
export const scoringApi = {
  /**
   * Score single candidate
   */
  scoreCandidate: async (
    candidateId: string,
    jobRequirementId: string
  ) => {
    const response = await axiosInstance.post<ScoreResponse>(
      `/api/score/${encodeURIComponent(candidateId)}`,
      { job_requirement_id: jobRequirementId }
    );
    return response.data;
  },

  /**
   * Score multiple candidates
   */
  scoreBatch: async (
    candidateIds: string[],
    jobRequirementId: string
  ) => {
    const response = await axiosInstance.post<{
      total: number;
      scored: number;
      failed: number;
      results: ScoreResponse[];
    }>('/api/score/batch', {
      candidate_ids: candidateIds,
      job_requirement_id: jobRequirementId,
    });
    return response.data;
  },

  /**
   * Get ranked candidates
   */
  getRankedCandidates: async (
    jobRequirementId: string,
    params?: { limit?: number; offset?: number }
  ) => {
    const response = await axiosInstance.get<Candidate[]>(
      `/api/score/ranked/${encodeURIComponent(jobRequirementId)}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get score details
   */
  getScoreDetails: async (candidateId: string, jobId: string) => {
    const response = await axiosInstance.get<ScoreResponse>(
      `/api/score/${encodeURIComponent(candidateId)}/details`,
      { params: { job_id: jobId } }
    );
    return response.data;
  },
};

// ==================== JOB REQUIREMENTS ====================
export const jobApi = {
  /**
   * Create new job requirement
   */
  createJobRequirement: async (data: Omit<JobRequirement, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await axiosInstance.post<JobRequirement>(
      '/api/jobs',
      data
    );
    return response.data;
  },

  /**
   * Get job requirement
   */
  getJobRequirement: async (jobId: string) => {
    const response = await axiosInstance.get<JobRequirement>(
      `/api/jobs/${encodeURIComponent(jobId)}`
    );
    return response.data;
  },

  /**
   * List all job requirements
   */
  listJobRequirements: async () => {
    const response = await axiosInstance.get<JobRequirement[]>(
      '/api/jobs'
    );
    return response.data;
  },

  /**
   * Update job requirement
   */
  updateJobRequirement: async (
    jobId: string,
    data: Partial<JobRequirement>
  ) => {
    const response = await axiosInstance.put<JobRequirement>(
      `/api/jobs/${encodeURIComponent(jobId)}`,
      data
    );
    return response.data;
  },

  /**
   * Delete job requirement
   */
  deleteJobRequirement: async (jobId: string) => {
    const response = await axiosInstance.delete(`/api/jobs/${encodeURIComponent(jobId)}`);
    return response.data;
  },
};

// ==================== HEALTH CHECK ====================
export const systemApi = {
  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await axiosInstance.get('/api/health');
    return response.data;
  },

  /**
   * Get system stats
   */
  getStats: async () => {
    const response = await axiosInstance.get('/api/stats');
    return response.data;
  },
};

export default axiosInstance;