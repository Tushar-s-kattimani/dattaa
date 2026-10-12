import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Toaster } from 'react-hot-toast';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-8 flex-1">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};


