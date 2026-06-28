import React from 'react';
import { Files, Search, GitBranch, Play, Cpu, Settings, ChevronDown, ChevronRight, FileCode2, FileJson } from 'lucide-react';

export const VSCodeShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-6 shrink-0 border-r border-[#252526] z-20">
        <Files size={24} className="text-[#858585] hover:text-white cursor-pointer transition-colors" />
        <Search size={24} className="text-[#858585] hover:text-white cursor-pointer transition-colors" />
        <GitBranch size={24} className="text-[#858585] hover:text-white cursor-pointer transition-colors" />
        <Play size={24} className="text-[#858585] hover:text-white cursor-pointer transition-colors" />
        <div className="relative group cursor-pointer">
          <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#333333] z-10">1</div>
          <Cpu size={24} className="text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500 -ml-[14px]"></div>
        </div>
        <div className="flex-1" />
        <Settings size={24} className="text-[#858585] hover:text-white cursor-pointer mb-2 transition-colors" />
      </div>
      
      {/* Primary Side Bar (Explorer) */}
      <div className="w-64 bg-[#252526] flex flex-col shrink-0 border-r border-[#1e1e1e] z-10">
        <div className="text-[11px] uppercase tracking-wider px-4 py-3 font-semibold text-[#cccccc]">Explorer</div>
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1 font-bold">
            <ChevronDown size={14} /> workspace
          </div>
          <div className="px-6 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <ChevronDown size={14} /> src
          </div>
          <div className="px-10 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <ChevronRight size={14} /> components
          </div>
          <div className="px-10 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <ChevronRight size={14} /> services
          </div>
          <div className="px-14 py-1 text-sm text-cyan-300 bg-[#37373d]/50 hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <FileCode2 size={14} className="text-cyan-400" /> secureAuth.ts
          </div>
          <div className="px-14 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <FileCode2 size={14} className="text-emerald-400" /> secureAuth.test.ts
          </div>
          <div className="px-6 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5 mt-1">
            <FileJson size={14} className="text-yellow-400" /> package.json
          </div>
          <div className="px-6 py-1 text-sm text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-1.5">
            <FileJson size={14} className="text-purple-400" /> synapseai.json
          </div>
        </div>
      </div>

      {/* Main Editor Area (Webview) */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Editor Tabs */}
        <div className="h-9 bg-[#2d2d2d] flex items-center shrink-0 overflow-x-auto hide-scrollbar">
          <div className="h-full px-4 flex items-center gap-2 bg-[#1e1e1e] border-t border-cyan-500 text-cyan-400 text-sm cursor-pointer min-w-max">
            <Cpu size={14} /> SynapseAI Dashboard
            <div className="ml-2 w-2 h-2 rounded-full bg-cyan-500"></div>
          </div>
          <div className="h-full px-4 flex items-center gap-2 text-[#858585] hover:bg-[#1e1e1e] text-sm cursor-pointer min-w-max border-r border-[#2d2d2d]">
            <FileCode2 size={14} /> secureAuth.ts
          </div>
        </div>
        {/* Webview Content */}
        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
