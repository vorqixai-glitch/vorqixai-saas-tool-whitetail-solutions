import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { Navigate, Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { ShieldCheck } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export default function AdminLogin() {
  const { token, setAuth, user } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => setAuth(data.token, data.user),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => setAuth(data.token, data.user),
  });

  if (token) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    try {
      if (isRegister) {
        registerSchema.parse({ email, password, name });
        // Hardcoded as admin
        registerMutation.mutate({ email, password, name, role: 'admin' });
      } else {
        loginSchema.parse({ email, password });
        loginMutation.mutate({ email, password });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        ((err as any).errors || []).forEach((e: any) => {
          if (e.path && e.path[0]) {
            errors[e.path[0].toString()] = e.message;
          }
        });
        setValidationErrors(errors);
      }
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-400">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          System Administration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          For internal White Tail staff only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300">Staff Full Name</label>
                <div className="mt-1">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 bg-slate-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  {validationErrors.name && <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300">Staff Email address</label>
              <div className="mt-1">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 bg-slate-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {validationErrors.email && <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 bg-slate-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {validationErrors.password && <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>}
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error.message}</div>}

            <div>
              <button disabled={isPending} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isPending ? 'Processing...' : (isRegister ? 'Register Admin Account' : 'Admin Login')}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
              {isRegister ? 'Already have an admin account? Sign in' : "New admin? Register here"}
            </button>
            <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300">
              Return to Client Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
