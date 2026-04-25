import { cn } from '@/lib/utils';
import { SuggestionItem } from '@/store/useAppStore';
import { Plus, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface SuggestionCardProps {
  item: SuggestionItem;
  onClick?: (item: SuggestionItem) => void;
  onAddAction?: (item: SuggestionItem) => void;
}

export function SuggestionCard({ item, onClick, onAddAction }: SuggestionCardProps) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!added && onAddAction) {
      onAddAction(item);
      setAdded(true);
    }
  };

  return (
    <div 
      className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-sky-300 transition-all cursor-pointer group"
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
            item.type === 'action_item' 
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
              : 'text-sky-600 bg-sky-50 border-sky-100'
          }`}>
            {item.type.replace('_', ' ')}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
        </div>
        
        <p className="text-[15px] font-semibold text-[#0f2e4a] leading-snug">
          {item.preview}
        </p>

        {item.type === 'action_item' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!added && onAddAction) {
                onAddAction(item);
                setAdded(true);
              }
            }}
            disabled={added}
            className="mt-1 flex items-center justify-center gap-2 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#0f2e4a] border border-slate-200 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {added ? 'Added ✓' : <><Plus className="w-3.5 h-3.5" /> Add to To-Do</>}
          </button>
        )}
      </div>
    </div>
  );
}
