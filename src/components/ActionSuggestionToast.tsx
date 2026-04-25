'use client';

import { useAppStore } from '@/store/useAppStore';
import { X, Calendar, Clock, Target, CheckSquare, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ActionSuggestionToast() {
  const { pendingActions, dismissAction, sessionId } = useAppStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Auto-dismiss the entire queue after 20s if no interaction
  useEffect(() => {
    if (pendingActions.length > 0) {
      const timer = setTimeout(() => {
        useAppStore.getState().clearAllPendingActions();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [pendingActions.length]);

  if (pendingActions.length === 0) return null;

  // Max 3 shown at a time
  const visibleActions = pendingActions.slice(0, 3);

  const handleAdd = async (id: string, action: any) => {
    if (!sessionId) return;
    
    setAddedIds(prev => new Set(prev).add(id));

    try {
      await fetch(`/api/sessions/${sessionId}/todos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: action.suggestedTask,
          timing: action.timing,
          type: action.type
        })
      });
      
      // Keep showing "Added" for 2s before removing
      setTimeout(() => {
        dismissAction(id);
        setAddedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);

    } catch (err) {
      console.error('Failed to add suggested action', err);
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-[360px] w-full">
      {visibleActions.map((action) => {
        const isAdded = addedIds.has(action.id);
        const isToday = action.timing === 'today';
        const isTask = action.type === 'task';

        return (
          <div 
            key={action.id} 
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-8 fade-in duration-300 relative group overflow-hidden"
          >
            {/* Dismiss Button */}
            <button 
              onClick={() => dismissAction(action.id)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-3">
              {/* Badges */}
              <div className="flex items-center gap-2 pr-8">
                <span className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                  isToday 
                    ? 'text-amber-600 border-amber-200 bg-amber-50' 
                    : 'text-blue-600 border-blue-200 bg-blue-50'
                }`}>
                  {isToday ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  {action.timing}
                </span>

                <span className={`flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                  isTask 
                    ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                    : 'text-purple-600 border-purple-200 bg-purple-50'
                }`}>
                  {isTask ? <CheckSquare className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                  {action.type}
                </span>
              </div>

              {/* Task Title */}
              <p className="text-sm font-bold text-slate-800 leading-snug">
                {action.suggestedTask}
              </p>

              {/* Context */}
              <p className="text-[11px] text-slate-500 italic line-clamp-1 border-l-2 border-slate-100 pl-2">
                "{action.text}"
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleAdd(action.id, action)}
                disabled={isAdded}
                className={`mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isAdded 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : 'bg-[#0f2e4a] hover:bg-[#1a3f61] text-white shadow-sm'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Added to To-Do
                  </>
                ) : (
                  <>
                    + Add to {isToday ? 'Today' : 'Later'}
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
