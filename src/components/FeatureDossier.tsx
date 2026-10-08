import React from 'react';
import { X, MapPin, Calendar, Users, Mountain, Compass, ChevronRight, Check } from 'lucide-react';
import { LunarFeature } from '../types/moon';

interface FeatureDossierProps {
  feature: LunarFeature | null;
  onClose: () => void;
  onFocus: (feature: LunarFeature) => void;
}

export const FeatureDossier: React.FC<FeatureDossierProps> = ({ feature, onClose, onFocus }) => {
  const [copied, setCopied] = React.useState(false);

  if (!feature) return null;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(feature.coordinatesFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="fixed top-16 right-4 z-30 w-88 max-w-[calc(100vw-2rem)] bg-[#0B0E17]/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase">{feature.type}</span>
            {feature.geologicalEra && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">{feature.geologicalEra}</span>
              </>
            )}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{feature.name}</h2>
          {feature.latinName && (
            <p className="text-xs italic text-slate-400">{feature.latinName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto text-xs">
        {/* Coordinates Box */}
        <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono text-slate-200">{feature.coordinatesFormatted}</span>
          </div>
          <button
            onClick={handleCopyCoords}
            className="text-[10px] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Copy'}
          </button>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2">
          {feature.diameterKm !== undefined && (
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Diameter
              </span>
              <span className="text-base font-semibold font-mono tabular-nums text-white">
                {feature.diameterKm} <span className="text-xs text-slate-400 font-normal">km</span>
              </span>
            </div>
          )}

          {feature.depthKm !== undefined && (
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Rim Depth
              </span>
              <span className="text-base font-semibold font-mono tabular-nums text-white">
                {feature.depthKm} <span className="text-xs text-slate-400 font-normal">km</span>
              </span>
            </div>
          )}

          {feature.elevationKm !== undefined && (
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Peak Elevation
              </span>
              <span className="text-base font-semibold font-mono tabular-nums text-white">
                +{feature.elevationKm} <span className="text-xs text-slate-400 font-normal">km</span>
              </span>
            </div>
          )}

          {feature.missionYear !== undefined && (
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                Landing Date
              </span>
              <span className="text-base font-semibold font-mono tabular-nums text-amber-400">
                {feature.missionYear}
              </span>
            </div>
          )}
        </div>

        {/* Apollo Crew (if applicable) */}
        {feature.missionCrew && feature.missionCrew.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Astronaut Crew</span>
            </div>
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
              {feature.missionCrew.map((astronaut, idx) => (
                <p key={idx} className="text-xs text-slate-200">
                  {idx === 0 ? 'Commander: ' : idx === 1 ? 'Lunar Module Pilot: ' : 'Command Module Pilot: '}
                  <span className="font-medium text-white">{astronaut}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Description Overview */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 block mb-1">
            Selenological Overview
          </span>
          <p className="text-xs leading-relaxed text-slate-300">
            {feature.description}
          </p>
        </div>

        {/* Scientific Discoveries / Highlights */}
        {feature.keyFindings && feature.keyFindings.length > 0 && (
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Key Scientific Discoveries
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {feature.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-tight">{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <button
          onClick={() => onFocus(feature)}
          className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Orbit & Focus Location</span>
        </button>
      </div>
    </section>
  );
};
