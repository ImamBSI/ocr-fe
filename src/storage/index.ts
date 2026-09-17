import { create } from 'zustand';
import type { Candidate, JobRequirement, UploadResponse, ScoreResponse } from '../types';

// ==================== UPLOAD STORE ====================
interface UploadState {
  uploads: UploadResponse[];
  isUploading: boolean;
  uploadProgress: number;
  addUpload: (upload: UploadResponse) => void;
  setIsUploading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  resetUpload: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploads: [],
  isUploading: false,
  uploadProgress: 0,
  addUpload: (upload) =>
    set((state) => ({
      uploads: [...state.uploads, upload],
    })),
  setIsUploading: (loading) => set({ isUploading: loading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  resetUpload: () =>
    set({ uploads: [], isUploading: false, uploadProgress: 0 }),
}));

// ==================== CANDIDATE STORE ====================
interface CandidateState {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  isLoading: boolean;
  error: string | null;
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, candidate: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCandidates: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  selectedCandidate: null,
  isLoading: false,
  error: null,
  setCandidates: (candidates) => set({ candidates }),
  addCandidate: (candidate) =>
    set((state) => ({
      candidates: [...state.candidates, candidate],
    })),
  updateCandidate: (id, candidate) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, ...candidate } : c
      ),
    })),
  removeCandidate: (id) =>
    set((state) => ({
      candidates: state.candidates.filter((c) => c.id !== id),
    })),
  setSelectedCandidate: (candidate) => set({ selectedCandidate: candidate }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearCandidates: () =>
    set({ candidates: [], selectedCandidate: null, error: null }),
}));

// ==================== SCORING STORE ====================
interface ScoringState {
  scoredCandidates: Candidate[];
  sortBy: 'score' | 'name' | 'date';
  sortOrder: 'asc' | 'desc';
  filterMinScore: number;
  topN: number;
  setScoredCandidates: (candidates: Candidate[]) => void;
  setSortBy: (sortBy: 'score' | 'name' | 'date') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilterMinScore: (score: number) => void;
  setTopN: (n: number) => void;
  getFilteredAndSorted: () => Candidate[];
}

export const useScoringStore = create<ScoringState>((set, get) => ({
  scoredCandidates: [],
  sortBy: 'score',
  sortOrder: 'desc',
  filterMinScore: 0,
  topN: 20,
  setScoredCandidates: (candidates) => set({ scoredCandidates: candidates }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setFilterMinScore: (score) => set({ filterMinScore: score }),
  setTopN: (n) => set({ topN: n }),
  getFilteredAndSorted: () => {
    const state = get();
    let filtered = state.scoredCandidates.filter(
      (c) => c.score >= state.filterMinScore
    );

    filtered.sort((a, b) => {
      let compareValue = 0;
      if (state.sortBy === 'score') {
        compareValue = a.score - b.score;
      } else if (state.sortBy === 'name') {
        compareValue = a.name.localeCompare(b.name);
      } else if (state.sortBy === 'date') {
        compareValue =
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime();
      }

      return state.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return filtered.slice(0, state.topN);
  },
}));

// ==================== JOB REQUIREMENT STORE ====================
interface JobRequirementState {
  jobs: JobRequirement[];
  selectedJob: JobRequirement | null;
  isLoading: boolean;
  error: string | null;
  setJobs: (jobs: JobRequirement[]) => void;
  addJob: (job: JobRequirement) => void;
  updateJob: (id: string, job: Partial<JobRequirement>) => void;
  removeJob: (id: string) => void;
  setSelectedJob: (job: JobRequirement | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useJobStore = create<JobRequirementState>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) =>
    set((state) => ({
      jobs: [...state.jobs, job],
    })),
  updateJob: (id, job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...job } : j)),
    })),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),
  setSelectedJob: (job) => set({ selectedJob: job }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ==================== UI STORE ====================
interface UIState {
  sidebarOpen: boolean;
  currentTab: 'upload' | 'candidates' | 'ranking' | 'jobs';
  showModal: boolean;
  modalType: 'job-create' | 'job-edit' | 'none';
  setSidebarOpen: (open: boolean) => void;
  setCurrentTab: (tab: 'upload' | 'candidates' | 'ranking' | 'jobs') => void;
  setShowModal: (show: boolean) => void;
  setModalType: (type: 'job-create' | 'job-edit' | 'none') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentTab: 'upload',
  showModal: false,
  modalType: 'none',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setShowModal: (show) => set({ showModal: show }),
  setModalType: (type) => set({ modalType: type }),
}));