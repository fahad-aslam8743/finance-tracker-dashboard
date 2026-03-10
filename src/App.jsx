import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './Hooks/useAuth';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

const AppContent = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="h-screen bg-black flex items-center justify-center text-white font-black animate-pulse text-2xl">ZENITH LOADING...</div>;
  }

  return <>
    <Toaster position="top-right" reverseOrder={false} />
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard"/> : <AuthPage type="login"/>} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard"/> : <AuthPage type="signup"/>} />
      <Route path="/dashboard" element={session ? <Dashboard/> : <Navigate to="/login"/>} />
      <Route path="/" element={<Navigate to="/dashboard"/>} />
    </Routes>
  </>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;