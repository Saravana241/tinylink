import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import HealthCheck from './components/HealthCheck';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-50">
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
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/healthz" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Health Check
                </Link>
              </div>
            </div>
          </nav>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/code/:code" element={<Stats />} />
            <Route path="/healthz" element={<HealthCheck />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-gray-500 text-sm">
              &copy; 2024 TinyLink. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;