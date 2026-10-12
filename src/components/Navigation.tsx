import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Store, List, Settings, LayoutDashboard, PlusCircle } from 'lucide-react';
import { dataService } from '../lib/dataService';
import clsx from 'clsx';

export const Navigation = () => {
  const [isCloud, setIsCloud] = useState<boolean | null>(null);

  useEffect(() => {
    dataService.isCloudConnected().then(setIsCloud);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Shop', path: '/add-shop', icon: PlusCircle },
    { name: 'Shop Records', path: '/records', icon: List },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo & Desktop Nav Links */}
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center">
                <Store className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Shop Contact Manager
                </span>
              </NavLink>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={({ isActive }) =>
                        clsx(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-blue-600 text-blue-600 font-semibold'
                            : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Status Indicator (optimized for both desktop & mobile) */}
            <div className="flex items-center">
              {isCloud ? (
                <span
                  className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="Connected to MongoDB Atlas"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1 sm:mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">MongoDB Atlas</span>
                  <span className="sm:hidden">Online</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  title="Running in Local Storage Mode"
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1 sm:mr-1.5 bg-amber-500 rounded-full"></span>
                  <span className="hidden sm:inline">Local Storage Mode</span>
                  <span className="sm:hidden">Offline / Local</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Features / Menu Down) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'relative flex flex-col items-center justify-center py-1 transition-all duration-150',
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active highlight pill */}
                    {isActive && (
                      <span className="absolute top-0 w-8 h-1 bg-blue-600 rounded-full" />
                    )}
                    <div
                      className={clsx(
                        'p-1 rounded-full transition-transform',
                        isActive ? 'scale-110' : ''
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] mt-0.5 tracking-tight font-medium">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </>
  );
};
