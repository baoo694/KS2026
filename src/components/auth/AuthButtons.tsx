import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Up</span>
      </Link>
    </div>
  );
}

export function AuthButtonsMobile({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-2 pt-2 border-t border-slate-100">
      <Link
        href="/login"
        onClick={onClose}
        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
      <Link
        href="/register"
        onClick={onClose}
        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white"
      >
        <UserPlus className="h-4 w-4" />
        Sign Up
      </Link>
    </div>
  );
}
