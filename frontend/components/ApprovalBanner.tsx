import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldAlert, Check, X } from 'lucide-react';
import { useEngineStore } from '../store';

export const ApprovalBanner: React.FC = () => {
  const { pendingApproval, setPendingApproval, stopEngine, addLog } = useEngineStore();

  const handleApprove = async () => {
    addLog('SYSTEM', 'Human approval granted. Resuming execution.', 'success', 'webview');
    await pendingApproval!.resumeToken();
    setPendingApproval(null);
  };

  const handleReject = () => {
    addLog('SYSTEM', 'Human approval rejected. Halting execution.', 'error', 'webview');
    setPendingApproval(null);
    stopEngine();
  };

  return (
    <AnimatePresence>
      {pendingApproval && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-amber-500/10 border-y border-amber-500/30 p-3 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-full text-amber-400">
              <ShieldAlert size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-amber-400 font-bold text-sm">Human Approval Required</h4>
              <p className="text-xs text-amber-200/70">{pendingApproval.operation}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-colors"
            >
              <X size={14} /> Reject
            </button>
            <button 
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 transition-colors"
            >
              <Check size={14} /> Approve & Execute
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
