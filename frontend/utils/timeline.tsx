import React from 'react';
import { BrainCircuit, Code2, ShieldCheck, TerminalSquare, Settings } from 'lucide-react';

/**
 * Returns the lucide icon representing a timeline actor, colour-coded per agent.
 * Shared by every timeline / activity view so the actor visuals stay consistent.
 */
export const getActorIcon = (actor: string, size = 16): React.ReactElement => {
  switch (actor) {
    case 'CONDUCTOR':
      return <BrainCircuit size={size} className="text-purple-400" />;
    case 'CODER':
      return <Code2 size={size} className="text-blue-400" />;
    case 'REVIEWER':
      return <ShieldCheck size={size} className="text-emerald-400" />;
    case 'RUNNER':
      return <TerminalSquare size={size} className="text-amber-400" />;
    default:
      return <Settings size={size} className="text-slate-400" />;
  }
};

/**
 * Maps a timeline status/phase to the badge colour classes used for status pills.
 */
export const getStatusColorClass = (status: string): string => {
  switch (status) {
    case 'info':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'testing':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'success':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'warning':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'error':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};
