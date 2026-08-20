import React from 'react';
import { ListMusic, Trash2, Clock, Play, User, XCircle } from 'lucide-react';
import { AudioQueueItem } from '../types';

interface QueueManagerProps {
  queue: AudioQueueItem[];
  isProcessing: boolean;
  onClearQueue: () => void;
  onRemoveItem: (id: string) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  isProcessing,
  onClearQueue,
  onRemoveItem
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">Audio & Redeem Queue</h2>
          {queue.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/20">
              {queue.length} Pending
            </span>
          )}
        </div>
        {queue.length > 0 && (
          <button
            onClick={onClearQueue}
            className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            CLEAR ALL
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center space-y-2">
            <Clock className="w-8 h-8 opacity-20" />
            <p className="text-xs">Queue is empty. Redeems will appear here.</p>
          </div>
        ) : (
          queue.map((item, idx) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                idx === 0 && isProcessing
                  ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  idx === 0 && isProcessing ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                }`}>
                  {idx === 0 && isProcessing ? (
                    <Play className="w-4 h-4 fill-current" />
                  ) : (
                    <span className="text-[10px] font-bold">#{idx + 1}</span>
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.username}
                    </span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Cancel specific request"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {isProcessing && queue.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Processing next redeem...</span>
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-100" />
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce delay-200" />
          </div>
        </div>
      )}
    </div>
  );
};
