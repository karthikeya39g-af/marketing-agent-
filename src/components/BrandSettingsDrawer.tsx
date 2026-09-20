import React, { useState } from 'react';
import { X, RotateCcw, Plus, Check } from 'lucide-react';
import { BrandDNA, INITIAL_BRAND_DNA } from '../types';

interface BrandSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brandDna: BrandDNA;
  onUpdateBrandDna: (updated: BrandDNA) => void;
}

export const BrandSettingsDrawer: React.FC<BrandSettingsDrawerProps> = ({
  isOpen,
  onClose,
  brandDna,
  onUpdateBrandDna,
}) => {
  const [formData, setFormData] = useState<BrandDNA>(brandDna);
  const [newTone, setNewTone] = useState('');
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setFormData(brandDna);
  }, [brandDna]);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof BrandDNA, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaletteChange = (index: number, hex: string) => {
    const updated = [...formData.color_palette] as [string, string, string];
    updated[index] = hex;
    setFormData((prev) => ({ ...prev, color_palette: updated }));
  };

  const handleAddTone = () => {
    if (newTone.trim()) {
      setFormData((prev) => ({
        ...prev,
        tone_of_voice: [...prev.tone_of_voice, newTone.trim().toLowerCase()],
      }));
      setNewTone('');
    }
  };

  const handleRemoveTone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tone_of_voice: prev.tone_of_voice.filter((_, i) => i !== index),
    }));
  };

  const handleAddForbiddenWord = () => {
    if (newForbiddenWord.trim()) {
      setFormData((prev) => ({
        ...prev,
        forbidden_words: [...prev.forbidden_words, newForbiddenWord.trim().toLowerCase()],
      }));
      setNewForbiddenWord('');
    }
  };

  const handleRemoveForbiddenWord = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      forbidden_words: prev.forbidden_words.filter((_, i) => i !== index),
    }));
  };

  const handlePillarWeightChange = (index: number, weight: number) => {
    const updatedPillars = formData.content_pillars.map((p, i) =>
      i === index ? { ...p, weight: Math.max(0, Math.min(1, weight)) } : p
    );
    setFormData((prev) => ({ ...prev, content_pillars: updatedPillars }));
  };

  const handleSave = () => {
    onUpdateBrandDna(formData);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setFormData(INITIAL_BRAND_DNA);
    onUpdateBrandDna(INITIAL_BRAND_DNA);
  };

  return (
    <div
      id="brand-settings-drawer"
      className="bg-white border-b border-neutral-200 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header & Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Brand DNA Settings</h2>
            <p className="text-xs text-neutral-500">
              The AI automatically enforces these rules, tone, and colors on every generated post.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="reset-brand-dna-btn"
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title="Reset to default brand data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              id="close-brand-dna-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editable Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 text-sm">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Business Name
            </label>
            <input
              id="brand-business-name-input"
              type="text"
              value={formData.business_name}
              onChange={(e) => handleTextChange('business_name', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-neutral-50/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Category
            </label>
            <input
              id="brand-category-input"
              type="text"
              value={formData.category}
              onChange={(e) => handleTextChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-neutral-50/50"
            />
          </div>

          {/* Positioning Statement */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Positioning Statement
            </label>
            <input
              id="brand-positioning-input"
              type="text"
              value={formData.positioning_statement}
              onChange={(e) => handleTextChange('positioning_statement', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-neutral-50/50"
            />
          </div>

          {/* Color Palette (3 Hex Codes) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Brand Color Palette (3 Hex Codes)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formData.color_palette.map((color, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handlePaletteChange(idx, e.target.value)}
                    className="w-7 h-7 rounded border border-neutral-300 cursor-pointer p-0 shrink-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handlePaletteChange(idx, e.target.value)}
                    className="w-full text-xs font-mono font-medium text-neutral-700 focus:outline-none uppercase"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Color 1: Primary banner & buttons | Color 2: Gold accent | Color 3: Background
            </p>
          </div>

          {/* Language Style */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Language Style
            </label>
            <input
              id="brand-language-style-input"
              type="text"
              value={formData.language_style}
              onChange={(e) => handleTextChange('language_style', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-neutral-50/50"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              e.g. 60% Telugu, 40% English, natural code-switching
            </p>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tone of Voice (Adjectives)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tone_of_voice.map((tone, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                >
                  {tone}
                  <button
                    type="button"
                    onClick={() => handleRemoveTone(idx)}
                    className="hover:text-red-700 cursor-pointer text-amber-700 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTone}
                onChange={(e) => setNewTone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTone())}
                placeholder="Add adjective (e.g. festive)..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
              <button
                type="button"
                onClick={handleAddTone}
                className="px-2.5 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Forbidden Words */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Forbidden Words (Model will NEVER use these)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.forbidden_words.map((word, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-red-50 text-red-800 border border-red-200 font-medium"
                >
                  {word}
                  <button
                    type="button"
                    onClick={() => handleRemoveForbiddenWord(idx)}
                    className="hover:text-red-950 cursor-pointer text-red-600 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newForbiddenWord}
                onChange={(e) => setNewForbiddenWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddForbiddenWord())}
                placeholder="Add forbidden word (e.g. cheap)..."
                className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="button"
                onClick={handleAddForbiddenWord}
                className="px-2.5 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Content Pillars */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Content Pillars & Topic Weighting
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {formData.content_pillars.map((pillar, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-neutral-800 capitalize">{pillar.name}</span>
                    <span className="font-mono text-neutral-500 font-bold">{Math.round(pillar.weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={pillar.weight}
                    onChange={(e) => handlePillarWeightChange(idx, parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save-brand-dna-btn"
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: formData.color_palette[0] || '#8B1A1A' }}
          >
            {saveToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Brand DNA</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
