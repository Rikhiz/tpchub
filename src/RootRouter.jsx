import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import App from './jsx/App';
import Admin from './jsx/AdminDsb';

const RootRouter = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('authUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRole(user.role);
    } else {
      setRole('anonymous');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Jika role admin, arahkan ke /admin */}
        {role === 'admin' ? (
          <>
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/*" element={<App />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default RootRouter;
