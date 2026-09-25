import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '@/layout';
import UploadPage from '@/pages/upload-page/page';
import CandidatesPage from '@/pages/candidate-page/page';
import RankingPage from '@/pages/ranking-page/page';
import JobRequirementsPage from '@/pages/job-requirement/page';
import NotFound from '@/pages/NotFound';

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/job-req" element={<JobRequirementsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;