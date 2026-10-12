import { useEffect, useState } from 'react';
import { dataService } from '../lib/dataService';
import { Store, MapPin, CalendarDays } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalShops: 0,
    totalLocations: 0,
    shopsAddedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dataService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const statCards = [
    { name: 'Total Shops', value: stats.totalShops, icon: Store, color: 'bg-blue-500' },
    { name: 'Total Locations', value: stats.totalLocations, icon: MapPin, color: 'bg-emerald-500' },
    { name: 'Shops Added Today', value: stats.shopsAddedToday, icon: CalendarDays, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">{stat.name}</dt>
                      <dd className="text-3xl font-semibold text-slate-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
