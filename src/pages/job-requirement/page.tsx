import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useJobStore } from '@/storage';
import { useJobRequirements } from '@/hooks/useJobRequirements';
import { JobRequirementForm } from '@/components/job-req-form';
import type { JobRequirement } from '@/types';

export const JobRequirementsPage: React.FC = () => {
  const { jobs } = useJobStore();
  const { fetchJobs } = useJobRequirements();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRequirement | null>(null);

  const openCreateForm = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const openEditForm = (job: JobRequirement) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingJob(null);
    fetchJobs();
  };

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
          onClick={openCreateForm}
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
                    {(job.criteria || []).map((criterion) => (
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
                  onClick={() => openEditForm(job)}
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
        isOpen={isFormOpen}
        editingJob={editingJob || undefined}
        onClose={closeForm}
      />
    </div>
  );
};

export default JobRequirementsPage;