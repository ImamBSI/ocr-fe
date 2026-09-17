import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useUIStore, useCandidateStore, useJobStore, useScoringStore } from '@/storage';
import { useScoring } from '@/hooks/useScoring';
import {useJobRequirements} from '@/hooks/useJobRequirements';
import { CVUploader } from '@/components/cv-uploader';
import { CandidateList } from '@/components/candidate-list';
import { JobRequirementForm } from '@/components/job-req-form';
import { useProcessCV } from '@/hooks/useProcessCV';

export const Home: React.FC = () => {
  const { currentTab, setShowModal, setModalType, showModal, modalType } =
    useUIStore();
  const { candidates } = useCandidateStore();
  const { scoredCandidates } = useScoringStore();
  const { jobs, selectedJob } = useJobStore();
  const { processCV, listCVs, isLoading: processingLoading } = useProcessCV();
  const { scoreBatch, isLoading: scoringLoading } = useScoring();
  const { fetchJobs } = useJobRequirements();

  const [localLoading, setLocalLoading] = useState(false);

  // Process all pending candidates
  const handleProcessAllCandidates = async () => {
    if (candidates.length === 0) {
      alert('No candidates to process');
      return;
    }

    setLocalLoading(true);
    try {
      // In a real scenario, you'd have file IDs from upload responses
      // This is a placeholder for the workflow
      await listCVs();
    } catch (error) {
      console.error('Error processing candidates:', error);
      alert('Failed to process candidates');
    } finally {
      setLocalLoading(false);
    }
  };

  // Score all candidates
  const handleScoreAllCandidates = async () => {
    if (!selectedJob || candidates.length === 0) {
      alert('Please select a job and upload candidates first');
      return;
    }

    setLocalLoading(true);
    try {
      await scoreBatch(
        candidates.map((c) => c.id),
        selectedJob.id
      );
      alert('Scoring completed!');
    } catch (error) {
      console.error('Error scoring candidates:', error);
      alert('Failed to score candidates');
    } finally {
      setLocalLoading(false);
    }
  };

  // ==================== UPLOAD TAB ====================
  if (currentTab === 'upload') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload CV Documents
          </h1>
          <p className="text-gray-600">
            Upload candidate CVs in PDF or DOCX format. Our system will automatically extract and analyze the information.
          </p>
        </div>

        {/* Job Selection */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Job Requirement
          </h2>
          {jobs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">
                No job requirements found. Create one first.
              </p>
              <button
                onClick={() => {
                  setShowModal(true);
                  setModalType('job-create');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Job Requirement
              </button>
            </div>
          ) : (
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => {
                const job = jobs.find((j) => j.id === e.target.value);
                // You'll need to add setSelectedJob to job store
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a job...</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Uploader */}
        <CVUploader onUploadSuccess={handleProcessAllCandidates} />
      </div>
    );
  }

  // ==================== CANDIDATES TAB ====================
  if (currentTab === 'candidates') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidates Database
          </h1>
          <p className="text-gray-600">
            View and manage all processed candidates. {candidates.length} candidates
            found.
          </p>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">
              No candidates uploaded yet. Start by uploading CVs.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex gap-3">
              <button
                onClick={handleProcessAllCandidates}
                disabled={processingLoading || localLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {processingLoading || localLoading ? 'Processing...' : 'Refresh'}
              </button>
            </div>
            <CandidateList
              candidates={candidates}
              isLoading={processingLoading || localLoading}
              showScore={false}
            />
          </>
        )}
      </div>
    );
  }

  // ==================== RANKING TAB ====================
  if (currentTab === 'ranking') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Candidate Ranking
          </h1>
          <p className="text-gray-600">
            Candidates ranked by score for the selected job requirement.
          </p>
        </div>

        {!selectedJob ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800">
              Please select a job requirement in the Upload tab to see rankings.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">
              No candidates to rank. Upload and process CVs first.
            </p>
          </div>
        ) : scoredCandidates.length === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Candidates haven't been scored yet.
            </p>
            <button
              onClick={handleScoreAllCandidates}
              disabled={scoringLoading || localLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
            >
              {scoringLoading || localLoading
                ? 'Scoring...'
                : 'Score All Candidates'}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={handleScoreAllCandidates}
                disabled={scoringLoading || localLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {scoringLoading || localLoading ? 'Re-scoring...' : 'Re-score'}
              </button>
            </div>
            <CandidateList
              candidates={scoredCandidates}
              isLoading={scoringLoading || localLoading}
              showScore={true}
            />
          </>
        )}
      </div>
    );
  }

  // ==================== JOB REQUIREMENTS TAB ====================
  if (currentTab === 'jobs') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Job Requirements
            </h1>
            <p className="text-gray-600">
              Define scoring criteria for different job positions.
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setModalType('job-create');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">
              No job requirements created yet. Click "New Job" to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    {job.description && (
                      <p className="text-gray-600 text-sm mb-3">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {job.criteria.map((criterion) => (
                        <span
                          key={criterion.id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {criterion.name} (Weight: {criterion.weight})
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implement edit
                      setShowModal(true);
                      setModalType('job-edit');
                    }}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Form Modal */}
        <JobRequirementForm
          isOpen={showModal && modalType === 'job-create'}
          onClose={() => {
            setShowModal(false);
            setModalType('none');
            fetchJobs();
          }}
        />
      </div>
    );
  }

  return null;
};

export default Home;