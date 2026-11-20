import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CounselorDashboard } from './pages/counselor/CounselorDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

const AppRouter: React.FC = () => {
  const { view, currentUser, loading, toast } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-ink-muted">
        Memuat dashboard...
      </div>
    );
  }

  let content: React.ReactNode = <AuthPage />;
  if (view === 'dashboard' && currentUser) {
    if (currentUser.role === 'guru_bk') {
      content = <CounselorDashboard />;
    } else if (currentUser.role === 'admin') {
      content = <AdminDashboard />;
    } else {
      content = <StudentDashboard />;
    }
  }

  return (
    <>
      {content}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-sm ${
            toast.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : toast.tone === 'info'
                ? 'border-line bg-paper text-ink'
                : 'border-accent/30 bg-accent text-white'
          }`}
        >
          {toast.text}
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
};

export default App;
