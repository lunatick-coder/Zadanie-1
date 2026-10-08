import React, { useState } from 'react';
import { X, Search, Compass, ExternalLink } from 'lucide-react';
import { LunarFeature } from '../types/moon';
import { LUNAR_FEATURES } from '../data/moonFeatures';
import { sound } from '../utils/audio';

interface FeatureCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (feature: LunarFeature) => void;
}

export const FeatureCatalog: React.FC<FeatureCatalogProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'apollo' | 'crater' | 'mare' | 'basin'>('all');

  if (!isOpen) return null;

  const filtered = LUNAR_FEATURES.filter((f) => {
    const matchesTab = activeTab === 'all' || f.type === activeTab;
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.latinName && f.latinName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0B0E17] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Lunar Feature Index</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search craters, Apollo missions, maria, coordinates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['all', 'apollo', 'crater', 'mare', 'basin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  sound.playClick(600);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer capitalize ${
                  activeTab === tab
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {tab === 'all' ? 'All Features' : tab === 'apollo' ? 'Apollo Sites' : tab === 'mare' ? 'Maria (Seas)' : tab + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Feature List */}
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No lunar features found matching your search.
            </div>
          ) : (
            filtered.map((feature) => (
              <div
                key={feature.id}
                onClick={() => {
                  onSelectFeature(feature);
                  onClose();
                }}
                className="pt-2.5 first:pt-0 group flex items-start justify-between p-2.5 rounded-lg hover:bg-slate-900/80 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        feature.type === 'apollo'
                          ? 'bg-amber-400'
                          : feature.type === 'crater'
                          ? 'bg-cyan-400'
                          : feature.type === 'mare'
                          ? 'bg-purple-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {feature.name}
                    </h3>
                    {feature.missionYear && (
                      <span className="text-[10px] font-mono text-amber-400">
                        {feature.missionYear}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{feature.description}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
                    <span>{feature.coordinatesFormatted}</span>
                    {feature.diameterKm && <span>· Ø {feature.diameterKm} km</span>}
                    {feature.depthKm && <span>· Depth {feature.depthKm} km</span>}
                  </div>
                </div>

                <button className="px-2.5 py-1 text-[11px] font-medium text-slate-300 group-hover:text-cyan-300 bg-slate-800 group-hover:bg-cyan-500/20 rounded border border-slate-700 group-hover:border-cyan-500/40 transition-colors shrink-0 flex items-center gap-1">
                  <span>Examine</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
