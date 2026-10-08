import React from 'react';
import { Ruler, Activity, Globe, Compass } from 'lucide-react';
import { LUNAR_FACTS } from '../data/moonFeatures';

interface TelemetryBarProps {
  hoverLat: number | null;
  hoverLon: number | null;
  sunAngle: number;
  measuredKm: number | null;
  measurementActive: boolean;
  onClearMeasurement: () => void;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  hoverLat,
  hoverLon,
  sunAngle,
  measuredKm,
  measurementActive,
  onClearMeasurement,
}) => {
  // Format coordinate
  const formatCoord = (lat: number | null, lon: number | null) => {
    if (lat === null || lon === null) return 'SURFACE SCAN READY';
    const ns = lat >= 0 ? `${lat.toFixed(2)}° N` : `${Math.abs(lat).toFixed(2)}° S`;
    const ew = lon >= 0 ? `${lon.toFixed(2)}° E` : `${Math.abs(lon).toFixed(2)}° W`;
    return `${ns}, ${ew}`;
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-2.5 bg-[#05070B]/90 backdrop-blur-md border-t border-slate-800/80 text-xs">
      {/* Zone 1: Cursor Surface Coordinates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono uppercase text-slate-400">Surface Probe:</span>
          <span className="font-mono tabular-nums text-slate-100 font-semibold">
            {formatCoord(hoverLat, hoverLon)}
          </span>
        </div>

        {/* Measurement Result (if active) */}
        {measurementActive && (
          <div className="hidden md:flex items-center gap-2 border-l border-slate-700/80 pl-4">
            <Ruler className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono text-slate-400">Great-Circle Arc:</span>
            {measuredKm !== null ? (
              <span className="font-mono tabular-nums font-bold text-cyan-300">
                {measuredKm.toFixed(1)} km
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-mono">Select 2 surface points</span>
            )}
            {measuredKm !== null && (
              <button
                onClick={onClearMeasurement}
                className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-1"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Zone 2: Lunar Physical Constants */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-[11px] text-slate-400 tabular-nums">
        <div>
          <span>Radius: </span>
          <span className="text-slate-200">1,737.4 km</span>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span>Surface Gravity: </span>
          <span className="text-slate-200">{LUNAR_FACTS.surfaceGravityMs2} m/s² (16.6%)</span>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span>Mean Distance: </span>
          <span className="text-slate-200">384,400 km</span>
        </div>
        <div className="border-l border-slate-800 pl-4">
          <span>Orbital Period: </span>
          <span className="text-slate-200">{LUNAR_FACTS.orbitalPeriodDays} days</span>
        </div>
      </div>

      {/* Zone 3: Navigation Hint */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <span className="hidden sm:inline">Drag to Orbit · Scroll to Zoom</span>
      </div>
    </footer>
  );
};
