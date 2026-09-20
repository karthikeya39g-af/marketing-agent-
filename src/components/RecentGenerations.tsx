import React from 'react';
import { History, Sparkles } from 'lucide-react';
import { GeneratedAsset, BrandDNA } from '../types';

interface RecentGenerationsProps {
  history: GeneratedAsset[];
  activeId: string;
  onSelectAsset: (asset: GeneratedAsset) => void;
  brandDna: BrandDNA;
}

export const RecentGenerations: React.FC<RecentGenerationsProps> = ({
  history,
  activeId,
  onSelectAsset,
  brandDna,
}) => {
  if (history.length <= 1) return null;

  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-neutral-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Recent Generations ({history.length})
        </h3>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {history.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectAsset(item)}
              className={`shrink-0 flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
              }`}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-neutral-100 shrink-0">
                <img
                  src={item.image_url}
                  alt={item.tag}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-0 inset-x-0 h-2.5"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              <div className="max-w-[130px]">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700 truncate">
                  {item.tag}
                </span>
                <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">
                  {item.subject || 'Puja essentials'}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
