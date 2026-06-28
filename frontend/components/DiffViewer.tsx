import React from 'react';
import { FileCode2, Check, X } from 'lucide-react';
import { DiffFile } from '../types';

interface DiffViewerProps {
  files: DiffFile[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ files }) => {
  return (
    <div className="mt-2 border border-border rounded-md overflow-hidden bg-card text-xs font-mono">
      <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode2 size={14} />
          <span>Proposed Changes ({files.length} files)</span>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-[10px] font-sans font-medium transition-colors">
          Apply All
        </button>
      </div>
      
      <div className="divide-y divide-border">
        {files.map((file, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="px-3 py-1.5 bg-background flex items-center justify-between text-[11px]">
              <span className="text-foreground font-semibold">{file.filename}</span>
              <div className="flex gap-3 text-muted-foreground">
                <span className="text-emerald-400">+{file.additions}</span>
                <span className="text-red-400">-{file.deletions}</span>
              </div>
            </div>
            <div className="p-3 bg-[#0a0a0a] overflow-x-auto whitespace-pre text-muted-foreground leading-relaxed">
              {file.content.split('\n').map((line, i) => {
                let lineClass = '';
                let icon = null;
                if (line.startsWith('+')) {
                  lineClass = 'text-emerald-400 bg-emerald-400/10';
                  icon = <Check size={10} className="inline mr-2 opacity-50" />;
                } else if (line.startsWith('-')) {
                  lineClass = 'text-red-400 bg-red-400/10';
                  icon = <X size={10} className="inline mr-2 opacity-50" />;
                }
                return (
                  <div key={i} className={`px-2 py-0.5 rounded-sm ${lineClass}`}>
                    {icon || <span className="inline-block w-4" />}
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
