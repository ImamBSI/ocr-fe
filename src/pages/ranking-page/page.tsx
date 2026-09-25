import React, { useState } from 'react';
import { useCandidateStore, useJobStore, useScoringStore } from '@/storage';
import { useScoring } from '@/hooks/useScoring';
import { CandidateList } from '@/components/candidate-list';

export const RankingPage: React.FC = () => {
  const { candidates } = useCandidateStore();
  const { scoredCandidates } = useScoringStore();
  const { selectedJob } = useJobStore();
  const { scoreBatch, isLoading: scoringLoading } = useScoring();

  const [localLoading, setLocalLoading] = useState(false);

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
            Please select a job requirement in the Upload page to see rankings.
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
          <p className="text-gray-600">Candidates haven't been scored yet.</p>
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
};

export default RankingPage;