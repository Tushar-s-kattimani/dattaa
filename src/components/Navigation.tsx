import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Store, List, Settings, LayoutDashboard } from 'lucide-react';
import { dataService } from '../lib/dataService';
import clsx from 'clsx';

export const Navigation = () => {
  const [isCloud, setIsCloud] = useState<boolean | null>(null);

  useEffect(() => {
    dataService.isCloudConnected().then(setIsCloud);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Shop', path: '/add-shop', icon: Store },
    { name: 'Shop Records', path: '/records', icon: List },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-900">Shop Contact Manager</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
                          ? 'border-blue-500 text-slate-900'
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
          <div className="hidden sm:flex items-center">
            {isCloud ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Connected to MongoDB Atlas">
                <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                MongoDB Atlas
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Running in Local Storage Mode">
                <span className="w-2 h-2 mr-1.5 bg-amber-500 rounded-full"></span>
                Local Storage Mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified for this example */}
      <div className="sm:hidden border-t border-slate-200">
        <div className="pt-2 pb-3 space-y-1 flex overflow-x-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex-shrink-0 flex flex-col items-center p-2 rounded-md text-xs font-medium min-w-[80px]',
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )
                }
              >
                <Icon className="w-6 h-6 mb-1" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
