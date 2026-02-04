'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, GraduationCap, ClipboardCheck, Puzzle } from 'lucide-react';

interface StudyModeNavProps {
  setId: string;
}

const modes = [
  { key: 'flashcards', label: 'Flashcards', icon: Layers, color: 'indigo' },
  { key: 'learn', label: 'Learn', icon: GraduationCap, color: 'emerald' },
  { key: 'test', label: 'Test', icon: ClipboardCheck, color: 'amber' },
  { key: 'match', label: 'Match', icon: Puzzle, color: 'rose' },
];

const colorMap = {
  indigo: {
    active: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    hover: 'hover:bg-indigo-50 hover:text-indigo-600',
  },
  emerald: {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    hover: 'hover:bg-emerald-50 hover:text-emerald-600',
  },
  amber: {
    active: 'bg-amber-100 text-amber-700 border-amber-300',
    hover: 'hover:bg-amber-50 hover:text-amber-600',
  },
  rose: {
    active: 'bg-rose-100 text-rose-700 border-rose-300',
    hover: 'hover:bg-rose-50 hover:text-rose-600',
  },
};

export function StudyModeNav({ setId }: StudyModeNavProps) {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
      {modes.map(mode => {
        const href = `/sets/${setId}/${mode.key}`;
        const isActive = pathname === href;
        const colors = colorMap[mode.color as keyof typeof colorMap];
        const Icon = mode.icon;
        
        return (
          <Link
            key={mode.key}
            href={href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? `${colors.active} border shadow-sm` 
                : `text-slate-600 ${colors.hover}`
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{mode.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
