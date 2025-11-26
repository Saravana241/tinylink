import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import HealthCheck from './components/HealthCheck';

// Component for navigation with active state
const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "font-medium transition-colors";
    const activeClass = "text-blue-600 border-b-2 border-blue-600";
    const inactiveClass = "text-gray-600 hover:text-blue-600";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0">
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            TinyLink
          </Link>
        </div>
        <div className="flex space-x-8">
          <Link 
            to="/" 
            className={getLinkClass('/')}
          >
            Dashboard
          </Link>
          <Link 
            to="/healthz" 
            className={getLinkClass('/healthz')}
          >
            Health Check
          </Link>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <Navigation />
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/code/:code" element={<Stats />} />
            <Route path="/healthz" element={<HealthCheck />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;