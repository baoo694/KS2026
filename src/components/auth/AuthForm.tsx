'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { AuthResult } from '@/lib/actions/auth';

interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password' | 'reset-password';
  action: (formData: FormData) => Promise<AuthResult>;
}

export function AuthForm({ type, action }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const titles = {
    login: 'Welcome back! 👋',
    register: 'Create your account 🚀',
    'forgot-password': 'Reset your password 🔐',
    'reset-password': 'Set new password 🔑',
  };

  const subtitles = {
    login: 'Sign in to continue your learning journey',
    register: 'Start your learning journey today',
    'forgot-password': "We'll send you a reset link",
    'reset-password': 'Choose a strong password',
  };

  const buttonTexts = {
    login: 'Sign In',
    register: 'Create Account',
    'forgot-password': 'Send Reset Link',
    'reset-password': 'Update Password',
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.message) {
        setSuccess(result.message);
        // Redirect after successful authentication
        if (type === 'register') {
          setTimeout(() => {
            router.push('/login');
          }, 2000); // Wait 2 seconds to show success message before redirecting
        } else if (type === 'login') {
          // Navigate to home page - no need for refresh as replace triggers full page load
          router.replace('/');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {titles[type]}
            </h1>
            <p className="text-slate-500 text-sm">
              {subtitles[type]}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            {/* Email Field */}
            {type !== 'reset-password' && (
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
              </div>
            )}

            {/* Password Field */}
            {(type === 'login' || type === 'register' || type === 'reset-password') && (
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            {/* Confirm Password Field */}
            {(type === 'register' || type === 'reset-password') && (
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-[38px] h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            {/* Forgot Password Link */}
            {type === 'login' && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                buttonTexts[type]
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            {type === 'login' && (
              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            )}
            {type === 'register' && (
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            )}
            {(type === 'forgot-password' || type === 'reset-password') && (
              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Back to login
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <p className="mt-8 text-center text-sm text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
