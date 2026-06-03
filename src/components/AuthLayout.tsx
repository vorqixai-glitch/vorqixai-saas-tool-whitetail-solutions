import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { trpc } from '../utils/trpc';
import { LayoutDashboard, Users, FileText, CheckSquare, Settings, ShieldAlert, LogOut, Bot, GraduationCap, MessageSquare } from 'lucide-react';

export function AuthLayout() {
  const { token, logout, user: authUser } = useAuthStore();
  const location = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false
  });

  if (!token || authUser?.role === 'admin') {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading White Tail Solutions...</div>;
  }

  if (!user && !isLoading) {
    logout();
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Licensing', path: '/licensing', icon: ShieldAlert },
    { name: 'Residents', path: '/residents', icon: Users },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Compliance', path: '/compliance', icon: CheckSquare },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Consulting', path: '/consulting', icon: GraduationCap },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="font-semibold text-lg tracking-tight">White Tail</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-300">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1 text-slate-400 hover:text-white rounded-md" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
