import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useJobStore, useScoringStore } from '@/storage';
import { useJobRequirements } from '@/hooks/useJobRequirements';
import { useScoring } from '@/hooks/useScoring';
import { CandidateList } from '@/components/candidate-list';
import type { Candidate } from '@/types';

export const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, selectedJob, setSelectedJob } = useJobStore();
  const { scoredCandidates } = useScoringStore();
  const { fetchJobs } = useJobRequirements();
  const {
    getRankedCandidates,
    listCandidatesByJob,
    scoreAllForJob,
    isLoading,
  } = useScoring();

  const [applicants, setApplicants] = useState<Candidate[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const jobId = selectedJob?.id || '';
  const loading = isLoading || localLoading;

  // Pastikan daftar job ter-load
  useEffect(() => {
    if (jobs.length === 0) {
      fetchJobs().catch((err) => console.error('Failed to load jobs', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saat job dipilih: muat pelamar + ranking tersimpan
  useEffect(() => {
    if (!jobId) {
      setApplicants([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLocalLoading(true);
      try {
        const [people] = await Promise.all([
          listCandidatesByJob(jobId),
          getRankedCandidates(jobId, 100),
        ]);
        if (!cancelled) setApplicants(people);
      } catch (err) {
        console.error('Failed to load ranking for job', err);
      } finally {
        if (!cancelled) setLocalLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleScoreAll = async () => {
    if (!jobId) return;
    setLocalLoading(true);
    try {
      const { scored } = await scoreAllForJob(jobId);
      if (scored === 0) {
        alert('Belum ada kandidat yang melamar posisi ini.');
      }
    } catch (err) {
      console.error('Error scoring applicants:', err);
      alert('Gagal melakukan scoring');
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
          Pilih posisi, lihat pelamarnya, lalu generate ranking berdasarkan
          job requirement.
        </p>
      </div>

      {/* Job Selector */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Posisi yang dilamar
        </label>
        {jobs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Belum ada job requirement. Buat dulu.
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
            value={jobId}
            onChange={(e) => {
              const job = jobs.find((j) => j.id === e.target.value) || null;
              setSelectedJob(job);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih posisi...</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      {jobs.length === 0 ? null : !jobId ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800">
            Pilih posisi di atas untuk melihat pelamar dan rankingnya.
          </p>
        </div>
      ) : (
        <>
          {/* Ringkasan job */}
          {selectedJob && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedJob.title}
              </h2>
              {selectedJob.description && (
                <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {(selectedJob.criteria || []).map((c) => (
                  <span
                    key={c.id}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {c.name} (Weight: {c.weight})
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {applicants.length} pelamar · {scoredCandidates.length} sudah
                dinilai
              </p>
            </div>
          )}

          {applicants.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-2">
                Belum ada kandidat yang melamar posisi ini.
              </p>
              <p className="text-sm text-gray-500">
                Upload CV di halaman <strong>Upload CV</strong> sambil memilih
                posisi ini.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={handleScoreAll}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading
                    ? 'Memproses...'
                    : scoredCandidates.length === 0
                    ? `Score ${applicants.length} Pelamar`
                    : 'Re-score Semua Pelamar'}
                </button>
              </div>

              {scoredCandidates.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    {applicants.length} pelamar belum dinilai. Klik tombol di
                    atas untuk generate ranking.
                  </p>
                </div>
              ) : (
                <CandidateList
                  candidates={scoredCandidates}
                  isLoading={loading}
                  showScore={true}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RankingPage;
