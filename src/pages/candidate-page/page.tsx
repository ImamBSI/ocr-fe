import React, { useState } from 'react';
import { useCandidateStore, useUploadStore } from '@/storage';
import { useProcessCV } from '@/hooks/useProcessCV';
import { CandidateList } from '@/components/candidate-list';

export const CandidatesPage: React.FC = () => {
  const { candidates } = useCandidateStore();
  const { processBatch, listCVs, isLoading: processingLoading } = useProcessCV();

  const [localLoading, setLocalLoading] = useState(false);

  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      const uploadIds = useUploadStore
        .getState()
        .uploads.map((u) => u.id)
        .filter(Boolean);
      if (uploadIds.length > 0) {
        await processBatch(uploadIds);
      }
      await listCVs();
    } catch (error) {
      console.error('Error refreshing candidates:', error);
      alert('Gagal memuat kandidat');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Candidates Database
        </h1>
        <p className="text-gray-600">
          View and manage all processed candidates. {candidates.length}{' '}
          candidates found.
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
              onClick={handleRefresh}
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
};

export default CandidatesPage;