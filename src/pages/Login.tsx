import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { Navigate, Link } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { ShieldAlert } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
});

export default function Login() {
  const { token, setAuth, user } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
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
        registerMutation.mutate({ email, password, name, role: 'user' });
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          White Tail Solutions
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Operator Toolkit & Credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {validationErrors.email && <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                {validationErrors.password && <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error.message}</div>}

            <div>
              <button disabled={isPending} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isPending ? 'Processing...' : (isRegister ? 'Sign up' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 text-center flex flex-col items-center gap-4">
              <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
              <Link to="/admin/login" className="text-xs text-gray-500 hover:text-gray-700">
                White Tail Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
