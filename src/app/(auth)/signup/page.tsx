'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, UserPlus, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the account
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Step 2: Automatically sign in after successful signup
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/',
      });
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  
  const getStrengthDisplay = () => {
    switch (strength) {
      case 0: return { width: '0%', color: 'bg-transparent', text: '' };
      case 1: return { width: '25%', color: 'bg-red-500', text: 'Weak' };
      case 2: return { width: '50%', color: 'bg-orange-500', text: 'Fair' };
      case 3: return { width: '75%', color: 'bg-yellow-400', text: 'Good' };
      case 4: return { width: '100%', color: 'bg-emerald-500', text: 'Strong' };
      default: return { width: '0%', color: 'bg-transparent', text: '' };
    }
  };

  const strengthDisplay = getStrengthDisplay();

  return (
    <div className="w-full max-w-md">
      {/* Brand */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
          Twin<span className="text-[#60a5fa]">Mind</span>
        </h1>
        <p className="text-sm text-[#71717a] mt-2">
          Create your account
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 shadow-2xl">
        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-medium text-[#a1a1aa] mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                id="signup-email"
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
              htmlFor="signup-password"
              className="block text-xs font-medium text-[#a1a1aa] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
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
            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1 w-full bg-[#27272a] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strengthDisplay.color}`}
                    style={{ width: strengthDisplay.width }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium ${strengthDisplay.color.replace('bg-', 'text-')}`}>
                    {strengthDisplay.text}
                  </span>
                  <span className="text-[10px] text-[#52525b]">
                    Requires: 8+ chars, uppercase, number, special
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-medium text-[#a1a1aa] mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0f1115] text-slate-200 border border-[#3f3f46] rounded-lg pl-10 pr-10 py-2.5 text-sm placeholder:text-[#3f3f46] focus:outline-none focus:border-[#60a5fa] focus:ring-1 focus:ring-[#60a5fa]/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {passwordsMatch ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-400" />
                )}
                <span
                  className={`text-[10px] ${
                    passwordsMatch ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {passwordsMatch
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </span>
              </div>
            )}
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
              <UserPlus className="w-4 h-4" />
            )}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Link to Sign In */}
        <p className="text-center text-sm text-[#71717a] mt-6">
          Already have an account?{' '}
          <Link
            href="/signin"
            className="text-[#60a5fa] hover:text-[#93c5fd] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
