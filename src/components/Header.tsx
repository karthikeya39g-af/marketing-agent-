import React from 'react';
import { Sliders, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { BrandDNA } from '../types';

interface HeaderProps {
  brandDna: BrandDNA;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  brandDna,
  isSettingsOpen,
  onToggleSettings,
}) => {
  const primaryColor = brandDna.color_palette[0] || '#8B1A1A';
  const secondaryColor = brandDna.color_palette[1] || '#E8B84B';

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-colors duration-300"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 font-heading">
                BrandPilot <span className="font-medium text-neutral-500">Studio</span>
              </h1>
              <span className="hidden sm:inline-flex items-center text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                1-Click Marketing
              </span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1">
              Active Brand: <span className="font-semibold text-neutral-700">{brandDna.business_name}</span>
            </p>
          </div>
        </div>

        {/* Brand Settings Toggle Button */}
        <button
          id="brand-settings-toggle-btn"
          onClick={onToggleSettings}
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200/80 cursor-pointer select-none"
          aria-expanded={isSettingsOpen}
        >
          <div className="flex items-center -space-x-1 mr-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white shadow-xs"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
          <Sliders className="w-3.5 h-3.5 text-neutral-600" />
          <span>Brand Settings</span>
          {isSettingsOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </button>
      </div>
    </header>
  );
};
