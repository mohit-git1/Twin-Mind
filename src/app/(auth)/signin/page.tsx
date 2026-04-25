'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, Lock, LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function SignInForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return '';
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const displayError = error || getErrorMessage(urlError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/',
      });
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
          Twin<span className="text-[#60a5fa]">Mind</span>
        </h1>
        <p className="text-sm text-[#71717a] mt-2">
          Sign in to your account
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 shadow-2xl">
        {/* Error Display */}
        {displayError && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="signin-email"
              className="block text-xs font-medium text-[#a1a1aa] mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#0f1115] text-slate-200 border border-[#3f3f46] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-[#3f3f46] focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa]/30 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signin-password"
              className="block text-xs font-medium text-[#a1a1aa] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f1115] text-slate-200 border border-[#3f3f46] rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder:text-[#3f3f46] focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa]/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-slate-900 bg-[#60a5fa] hover:bg-[#3b82f6] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#60a5fa]/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Link to Sign Up */}
        <p className="text-center text-sm text-[#71717a] mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-[#60a5fa] hover:text-[#93c5fd] font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#60a5fa]" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
