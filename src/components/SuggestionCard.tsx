import { cn } from '@/lib/utils';
import { SuggestionItem } from '@/store/useAppStore';

interface SuggestionCardProps {
  item: SuggestionItem;
  onClick?: (item: SuggestionItem) => void;
}

export function SuggestionCard({ item, onClick }: SuggestionCardProps) {
  const typeStyles: Record<string, string> = {
    question: "text-[#60a5fa] border-[#1e3a8a] bg-[#172554]/30",
    talking_point: "text-[#c084fc] border-[#581c87] bg-[#3b0764]/30",
    answer: "text-[#4ade80] border-[#14532d] bg-[#052e16]/30",
    fact_check: "text-[#fbbf24] border-[#78350f] bg-[#451a03]/30",
    clarification: "text-[#818cf8] border-[#312e81] bg-[#1e1b4b]/30",
  };

  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className="group flex flex-col gap-2.5 rounded-lg border border-[#3f3f46] bg-[#161618] p-5 cursor-pointer hover:border-[#71717a] hover:bg-[#1a1a1d] transition-all duration-200"
    >
      <div className="flex items-center">
        <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border", typeStyles[item.type] || typeStyles.answer)}>
          {item.type.replace('_', ' ')}
        </span>
      </div>
      <p className="text-base font-medium text-slate-200 leading-relaxed group-hover:text-white transition-colors">
        {item.preview}
      </p>
    </div>
  );
}
