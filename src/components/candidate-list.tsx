import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  Mail,
  Briefcase,
  GraduationCap,
  Trash2,
  Eye,
} from 'lucide-react';
import type { Candidate } from '@/types';
import { useCandidateStore, useScoringStore } from '@/store';
import { cvApi } from '@/services/api';

interface CandidateListProps {
  candidates?: Candidate[];
  onSelectCandidate?: (candidate: Candidate) => void;
  showScore?: boolean;
  isLoading?: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates: externalCandidates,
  onSelectCandidate,
  showScore = true,
  isLoading = false,
}) => {
  const { candidates: storeCandidates, removeCandidate } = useCandidateStore();
  const { scoredCandidates, getFilteredAndSorted, topN, setTopN } =
    useScoringStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const displayCandidates = externalCandidates || storeCandidates;
  const candidates = showScore
    ? getFilteredAndSorted()
    : displayCandidates.slice(0, topN);

  const handleDelete = async (candidateId: string) => {
    setDeleteLoading(candidateId);
    try {
      await cvApi.deleteCV(candidateId);
      removeCandidate(candidateId);
    } catch (error) {
      console.error('Failed to delete candidate:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    if (score >= 40) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getScoreBadge = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No candidates found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top N Filter */}
      {showScore && (
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium text-gray-700">
            Show top:
          </label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 10, 15, 20, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} candidates
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Candidate Cards */}
      <div className="space-y-2">
        {candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {candidate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {candidate.name}
                        </h3>
                        {candidate.ranking && showScore && (
                          <span className="text-sm font-bold text-gray-400">
                            #{candidate.ranking}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {candidate.experience_years} years
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {showScore && (
                    <div
                      className={`text-right px-3 py-2 rounded-lg ${getScoreColor(
                        candidate.score
                      )}`}
                    >
                      <div className="text-2xl font-bold">
                        {candidate.score.toFixed(1)}
                      </div>
                      <div className="text-xs">Score</div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleExpand(candidate.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        expandedId === candidate.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === candidate.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                {/* Education */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Education</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">{candidate.education}</p>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Skills</span>
                  </div>
                  <div className="ml-6 flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 8).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 8 && (
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">
                        +{candidate.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Matched Criteria */}
                {showScore && Object.keys(candidate.matched_criteria).length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Matched Criteria
                    </span>
                    <div className="ml-6 mt-2 grid grid-cols-2 gap-2">
                      {Object.entries(candidate.matched_criteria).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2"
                          >
                            <span className="text-xs font-medium text-gray-600">
                              {key}:
                            </span>
                            <span
                              className={`text-xs font-bold ${getScoreBadge(
                                value as number
                              )}`}
                            >
                              {(value as number).toFixed(1)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onSelectCandidate?.(candidate)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    disabled={deleteLoading === candidate.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;