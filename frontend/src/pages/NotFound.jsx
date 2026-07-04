import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-slate-800 mb-6">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-primary-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
