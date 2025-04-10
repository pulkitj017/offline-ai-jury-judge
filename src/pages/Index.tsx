
import React, { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import { TeamProvider } from '@/context/TeamContext';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // Hardcoded credentials
    if (email === 'admin@jury.local' && password === 'jury123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-jury-lightGray">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <TeamProvider>
          <Dashboard />
        </TeamProvider>
      )}
    </div>
  );
};

export default Index;
