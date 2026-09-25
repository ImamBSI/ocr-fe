import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { JobRequirement, ScoringCriteria } from '@/types';
import { useJobRequirements } from '@/hooks/useJobRequirements';

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
  const [keywordInputs, setKeywordInputs] = useState<Record<string, string>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createJob, updateJobRequirement, isLoading } = useJobRequirements();

  const syncKeywordInputs = (items: ScoringCriteria[] | undefined) => {
    const inputs: Record<string, string> = {};
    (items || []).forEach((c) => {
      if (c.type === 'skill' || c.type === 'keyword') {
        inputs[c.id] = (c.keywords || []).join(', ');
      }
    });
    setKeywordInputs(inputs);
  };

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title);
      setDescription(editingJob.description || '');
      setCriteria(editingJob.criteria || []);
      syncKeywordInputs(editingJob.criteria);
    } else {
      resetForm();
    }
  }, [editingJob, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCriteria([]);
    setKeywordInputs({});
    setError('');
  };

  const addCriteria = () => {
    const id = `criteria-${Date.now()}`;
    setCriteria([
      ...criteria,
      {
        ...DEFAULT_CRITERIA,
        id,
      },
    ]);
    setKeywordInputs((prev) => ({ ...prev, [id]: '' }));
  };

  const updateCriteria = (index: number, updates: Partial<ScoringCriteria>) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], ...updates };
    setCriteria(newCriteria);
  };

  const removeCriteria = (index: number) => {
    const removed = criteria[index];
    setCriteria(criteria.filter((_, i) => i !== index));
    if (removed) {
      setKeywordInputs((prev) => {
        const next = { ...prev };
        delete next[removed.id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Judul pekerjaan wajib diisi');
      return;
    }

    if (criteria.length === 0) {
      setError('Minimal satu kriteria diperlukan');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        title,
        description,
        criteria: criteria.map((c) =>
          c.type === 'skill' || c.type === 'keyword'
            ? {
                ...c,
                keywords: (keywordInputs[c.id] || '')
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean),
              }
            : c
        ),
      };

      if (editingJob) {
        await updateJobRequirement(editingJob.id, data);
      } else {
        await createJob(data);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan job requirement');
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
            {editingJob ? 'Edit Job Requirement' : 'Buat Job Requirement Baru'}
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
              Judul Pekerjaan *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Senior Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi pekerjaan dan tanggung jawab..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Scoring Criteria */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kriteria Penilaian
              </h3>
              <button
                type="button"
                onClick={addCriteria}
                className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Kriteria
              </button>
            </div>

            <div className="space-y-4">
              {criteria.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    Belum ada kriteria. Klik "Tambah Kriteria" untuk memulai.
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
                        Kriteria {index + 1}
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
                      placeholder="Nama kriteria (mis. Kemampuan Python)"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {/* Type */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tipe Penilaian
                        </label>
                        <select
                          value={criterion.type}
                          onChange={(e) =>
                            updateCriteria(index, {
                              type: e.target.value as ScoringCriteria['type'],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="skill">Skill</option>
                          <option value="experience">Experience</option>
                          <option value="education">Education</option>
                          <option value="keyword">Keyword</option>
                          <option value="custom">Custom</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                          {criterion.type === 'skill' &&
                            'Skor = % skill CV yang cocok dengan keywords.'}
                          {criterion.type === 'experience' &&
                            'Skor dari tahun pengalaman CV vs rentang min-max.'}
                          {criterion.type === 'education' &&
                            'Skor dari level pendidikan di CV.'}
                          {criterion.type === 'keyword' &&
                            'Skor = % keywords yang muncul di teks CV.'}
                          {criterion.type === 'custom' &&
                            'Skor tetap 50 (butuh implementasi custom).'}
                        </p>
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Bobot (kepentingan 0-10)
                        </label>
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
                          placeholder="0-10"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Makin besar, makin berpengaruh ke skor akhir.
                        </p>
                      </div>
                    </div>

                    {/* Min/Max Tahun untuk Experience */}
                    {criterion.type === 'experience' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Min Tahun
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={criterion.min_value ?? ''}
                            onChange={(e) =>
                              updateCriteria(index, {
                                min_value:
                                  e.target.value === ''
                                    ? undefined
                                    : parseFloat(e.target.value),
                              })
                            }
                            placeholder="mis. 2"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Max Tahun
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={criterion.max_value ?? ''}
                            onChange={(e) =>
                              updateCriteria(index, {
                                max_value:
                                  e.target.value === ''
                                    ? undefined
                                    : parseFloat(e.target.value),
                              })
                            }
                            placeholder="mis. 6"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <textarea
                      value={criterion.description || ''}
                      onChange={(e) =>
                        updateCriteria(index, { description: e.target.value })
                      }
                      placeholder="Cara penilaian kriteria ini..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Keywords (untuk tipe skill dan keyword) */}
                    {(criterion.type === 'skill' ||
                      criterion.type === 'keyword') && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Keywords (pisahkan dengan koma)
                        </label>
                        <input
                          type="text"
                          value={keywordInputs[criterion.id] || ''}
                          onChange={(e) =>
                            setKeywordInputs((prev) => ({
                              ...prev,
                              [criterion.id]: e.target.value,
                            }))
                          }
                          placeholder="mis. Python, Django, REST API"
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
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : editingJob
                ? 'Perbarui'
                : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobRequirementForm;