'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthButtons, AuthButtonsMobile } from '@/components/auth/AuthButtons';

interface HeaderClientProps {
  user: User | null;
}

export function HeaderClient({ user }: HeaderClientProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/sets', label: 'My Sets' },
    { href: '/sets/all', label: 'All Sets' },
    { href: '/progress', label: 'Progress' },
  ];
  
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            PhenikaaQuizz
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {user && navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                pathname === link.href 
                  ? 'text-indigo-600' 
                  : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                href="/sets/new"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Set
              </Link>
              <UserMenu email={user.email || 'User'} />
            </>
          ) : (
            <AuthButtons />
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-slate-600" />
          ) : (
            <Menu className="h-6 w-6 text-slate-600" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {user && navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === link.href 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link
                href="/sets/new"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Create Set
              </Link>
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white text-sm font-medium">
                    {(user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-600 truncate flex-1">
                    {user.email}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <AuthButtonsMobile onClose={() => setIsMenuOpen(false)} />
          )}
        </nav>
      )}
    </header>
  );
}
