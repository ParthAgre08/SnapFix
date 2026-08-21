import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Footer from './components/layout/Footer';

import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthorityRoute from './components/layout/AuthorityRoute';
import ContractorRoute from './components/layout/ContractorRoute';

// Citizen Pages
import Home from './pages/Home';
import HowItWorksPage from './pages/HowItWorksPage';
import CommunityPage from './pages/CommunityPage';
import ReportIssuePage from './pages/ReportIssuePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Dedicated Institutional Auth Pages
import AuthorityLoginPage from './pages/authority/AuthorityLoginPage';
import ContractorLoginPage from './pages/contractor/ContractorLoginPage';

// Head Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AuthorityReportedIssues from './pages/authority/AuthorityReportedIssues';
import AuthorityPendingIssues from './pages/authority/AuthorityPendingIssues';
import AuthorityInProgressIssues from './pages/authority/AuthorityInProgressIssues';
import AuthorityResolvedIssues from './pages/authority/AuthorityResolvedIssues';
import AuthorityReportDetail from './pages/authority/AuthorityReportDetail';
import AuthorityDepartments from './pages/authority/AuthorityDepartments';
import AuthorityAnalytics from './pages/authority/AuthorityAnalytics';

// Department Contractor Pages
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorAssignedIssues from './pages/contractor/ContractorAssignedIssues';
import ContractorIssueDetail from './pages/contractor/ContractorIssueDetail';

function AppShell() {
  const location = useLocation();
  const isAuthorityOrContractor =
    location.pathname.startsWith('/authority') || location.pathname.startsWith('/contractor');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {!isAuthorityOrContractor && <Navbar />}
      {!isAuthorityOrContractor && <AnnouncementBar />}
      <main className="flex-1">
        <Routes>
          {/* Public & Citizen Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dedicated Institutional Login Routes */}
          <Route path="/authority/login" element={<AuthorityLoginPage />} />
          <Route path="/contractor/login" element={<ContractorLoginPage />} />

          {/* Head Authority Protected Routes */}
          <Route
            path="/authority"
            element={
              <AuthorityRoute>
                <AuthorityDashboard />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/reported"
            element={
              <AuthorityRoute>
                <AuthorityReportedIssues />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/pending"
            element={
              <AuthorityRoute>
                <AuthorityPendingIssues />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/in-progress"
            element={
              <AuthorityRoute>
                <AuthorityInProgressIssues />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/resolved"
            element={
              <AuthorityRoute>
                <AuthorityResolvedIssues />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/reports/:id"
            element={
              <AuthorityRoute>
                <AuthorityReportDetail />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/departments"
            element={
              <AuthorityRoute>
                <AuthorityDepartments />
              </AuthorityRoute>
            }
          />
          <Route
            path="/authority/analytics"
            element={
              <AuthorityRoute>
                <AuthorityAnalytics />
              </AuthorityRoute>
            }
          />

          {/* Department Contractor Protected Routes */}
          <Route
            path="/contractor"
            element={
              <ContractorRoute>
                <ContractorDashboard />
              </ContractorRoute>
            }
          />
          <Route
            path="/contractor/issues"
            element={
              <ContractorRoute>
                <ContractorAssignedIssues />
              </ContractorRoute>
            }
          />
          <Route
            path="/contractor/issues/:id"
            element={
              <ContractorRoute>
                <ContractorIssueDetail />
              </ContractorRoute>
            }
          />
          <Route
            path="/contractor/resolved"
            element={
              <ContractorRoute>
                <AuthorityResolvedIssues />
              </ContractorRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthorityOrContractor && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}
