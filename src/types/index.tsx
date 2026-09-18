// Candidate Types
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience_years: number;
  skills: string[];
  education?: string;
  score?: number;
  matched_criteria?: Record<string, number>;
  cv_text?: string;
  file_path?: string;
  file_name?: string;
  created_at?: string;
  ranking?: number;
  is_processed?: number | boolean;
}

// Scoring Criteria
export interface ScoringCriteria {
  id: string;
  name: string;
  weight: number;
  type: 'skill' | 'experience' | 'education' | 'keyword' | 'custom';
  min_value?: number;
  max_value?: number;
  keywords?: string[];
  description?: string;
}

// Job Requirement
export interface JobRequirement {
  id: string;
  title: string;
  description?: string;
  criteria: ScoringCriteria[];
  created_at: string;
  updated_at: string;
}

// Upload Response
export interface UploadResponse {
  id: string;
  file_name: string;
  file_path: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

// Process CV Response
export interface ProcessCVResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience_years: number;
  skills: string[];
  education: string;
  cv_text: string;
  status: 'success' | 'error';
  message?: string;
}

// Score Response
export interface ScoreResponse {
  id: string;
  candidate_id: string;
  score: number;
  matched_criteria: Record<string, number>;
  rank: number;
  status: 'success' | 'error';
  message?: string;
}

// Batch Process Response
export interface BatchProcessResponse {
  total: number;
  processed: number;
  failed: number;
  candidates: Candidate[];
}

// API Error Response
export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
  status_code?: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  page_size: number;
  sort_by?: 'score' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}