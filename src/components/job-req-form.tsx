import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { JobRequirement, ScoringCriteria } from '@/types';
import { useJobRequirements } from '@/hooks';
import { useJobStore } from '@/store';

interface JobRequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingJob?: JobRequirement;
}

const DEFAULT_CRITERIA: ScoringCriteria = {
  id: '',
  name: '',
  weight: 1,
  type: 'skill',
  description: '',
};

export const JobRequirementForm: React.FC<JobRequirementFormProps> = ({
  isOpen,
  onClose,
  editingJob,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createJob, updateJobRequirement, isLoading } = useJobRequirements();
  const { selectedJob } = useJobStore();

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title);
      setDescription(editingJob.description || '');
      setCriteria(editingJob.criteria);
    } else {
      resetForm();
    }
  }, [editingJob, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCriteria([]);
    setError('');
  };

  const addCriteria = () => {
    setCriteria([
      ...criteria,
      {
        ...DEFAULT_CRITERIA,
        id: `criteria-${Date.now()}`,
      },
    ]);
  };

  const updateCriteria = (index: number, updates: Partial<ScoringCriteria>) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], ...updates };
    setCriteria(newCriteria);
  };

  const removeCriteria = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Job title is required');
      return;
    }

    if (criteria.length === 0) {
      setError('At least one criteria is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        title,
        description,
        criteria,
      };

      if (editingJob) {
        await updateJobRequirement(editingJob.id, data);
      } else {
        await createJob(data);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save job requirement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingJob ? 'Edit Job Requirement' : 'Create New Job Requirement'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job description and responsibilities..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scoring Criteria */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scoring Criteria
              </h3>
              <button
                type="button"
                onClick={addCriteria}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Criteria
              </button>
            </div>

            <div className="space-y-4">
              {criteria.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    No criteria added yet. Click "Add Criteria" to get started.
                  </p>
                </div>
              ) : (
                criteria.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Criteria {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCriteria(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Name */}
                    <input
                      type="text"
                      value={criterion.name}
                      onChange={(e) =>
                        updateCriteria(index, { name: e.target.value })
                      }
                      placeholder="Criteria name (e.g., Python Skills)"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {/* Type */}
                      <select
                        value={criterion.type}
                        onChange={(e) =>
                          updateCriteria(index, {
                            type: e.target.value as ScoringCriteria['type'],
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="skill">Skill</option>
                        <option value="experience">Experience</option>
                        <option value="education">Education</option>
                        <option value="keyword">Keyword</option>
                        <option value="custom">Custom</option>
                      </select>

                      {/* Weight */}
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={criterion.weight}
                        onChange={(e) =>
                          updateCriteria(index, {
                            weight: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Weight (0-10)"
                        className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <textarea
                      value={criterion.description || ''}
                      onChange={(e) =>
                        updateCriteria(index, { description: e.target.value })
                      }
                      placeholder="How to score this criteria..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Keywords (for skill and keyword types) */}
                    {(criterion.type === 'skill' ||
                      criterion.type === 'keyword') && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Keywords (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={criterion.keywords?.join(', ') || ''}
                          onChange={(e) =>
                            updateCriteria(index, {
                              keywords: e.target.value
                                .split(',')
                                .map((k) => k.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g., Python, Django, REST API"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingJob ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobRequirementForm;