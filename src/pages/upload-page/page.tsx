import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useUploadStore } from '@/storage';
import { useProcessCV } from '@/hooks/useProcessCV';
import { CVUploader } from '@/components/cv-uploader';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, selectedJob, setSelectedJob } = useJobStore();
  const { processBatch, listCVs } = useProcessCV();

  const handleProcessAllCandidates = async () => {
    try {
      // Baca state terbaru agar tidak terkena stale closure saat
      // callback dipanggil 2 detik setelah upload selesai.
      const uploadIds = useUploadStore
        .getState()
        .uploads.map((u) => u.id)
        .filter(Boolean);
      if (uploadIds.length > 0) {
        await processBatch(uploadIds);
      }
      await listCVs();
    } catch (error) {
      console.error('Error processing candidates:', error);
      alert('Gagal memproses kandidat');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload CV Documents
        </h1>
        <p className="text-gray-600">
          Upload candidate CVs in PDF or DOCX format. Our system will
          automatically extract and analyze the information.
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
              onClick={() => navigate('/job-req')}
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
              const job = jobs.find((j) => j.id === e.target.value) || null;
              setSelectedJob(job);
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
};

export default UploadPage;