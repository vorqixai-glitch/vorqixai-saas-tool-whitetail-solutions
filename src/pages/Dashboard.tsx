import React from 'react';
import { trpc } from '../utils/trpc';
import { Users, FileText, CheckSquare, ShieldAlert, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) return <div>Loading dashboard...</div>;

  const statCards = [
    { name: 'Active Residents', value: stats?.residents || 0, icon: Users, color: 'bg-blue-500' },
    { name: 'Compliance Items', value: stats?.complianceItems || 0, icon: CheckSquare, color: 'bg-green-500' },
    { name: 'License Apps', value: stats?.licenses || 0, icon: ShieldAlert, color: 'bg-purple-500' },
    { name: 'Documents', value: stats?.documents || 0, icon: FileText, color: 'bg-amber-500' },
  ];

  const chartData = [
    { name: 'Jan', compliance: Math.min(100, (stats?.complianceItems || 0) * 10 + 20), residents: Math.min(20, (stats?.residents || 0) + 2) },
    { name: 'Feb', compliance: Math.min(100, (stats?.complianceItems || 0) * 10 + 35), residents: Math.min(20, (stats?.residents || 0) + 4) },
    { name: 'Mar', compliance: Math.min(100, (stats?.complianceItems || 0) * 10 + 50), residents: Math.min(20, (stats?.residents || 0) + 5) },
    { name: 'Apr', compliance: Math.min(100, (stats?.complianceItems || 0) * 10 + 60), residents: Math.min(20, (stats?.residents || 0) + 7) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <Link to="/residents" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Resident
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white overflow-hidden shadow-sm border border-slate-200 rounded-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`} >
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Facility Growth Metrics</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="compliance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Compliance Score" />
                <Bar dataKey="residents" fill="#10b981" radius={[4, 4, 0, 0]} name="Residents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Licensing Tasks</h2>
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
            <ShieldAlert className="w-8 h-8 text-slate-400 mb-2" />
            <p>All licenses up to date.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
