import React from 'react';
import {
  Sun,
  Layers,
  Play,
  Pause,
  Ruler,
  Globe2,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Compass
} from 'lucide-react';
import { MapMode, MoonPhase } from '../types/moon';
import { MOON_PHASES } from '../data/moonFeatures';
import { sound } from '../utils/audio';

interface SidebarControlsProps {
  mapMode: MapMode;
  onMapModeChange: (mode: MapMode) => void;
  sunAngle: number;
  onSunAngleChange: (angle: number) => void;
  earthshineEnabled: boolean;
  onEarthshineToggle: () => void;
  autoSpin: boolean;
  onAutoSpinToggle: () => void;
  spinSpeed: number;
  onSpinSpeedChange: (speed: number) => void;
  showLabels: boolean;
  onShowLabelsToggle: () => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  measurementActive: boolean;
  onToggleMeasurement: () => void;
  bumpIntensity: number;
  onBumpIntensityChange: (val: number) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  mapMode,
  onMapModeChange,
  sunAngle,
  onSunAngleChange,
  earthshineEnabled,
  onEarthshineToggle,
  autoSpin,
  onAutoSpinToggle,
  spinSpeed,
  onSpinSpeedChange,
  showLabels,
  onShowLabelsToggle,
  filterType,
  onFilterTypeChange,
  measurementActive,
  onToggleMeasurement,
  bumpIntensity,
  onBumpIntensityChange,
  isOpen,
  onToggleOpen,
}) => {
  // Find closest moon phase name
  const currentPhase = MOON_PHASES.reduce((prev, curr) => {
    return Math.abs(curr.angleDeg - sunAngle) < Math.abs(prev.angleDeg - sunAngle) ? curr : prev;
  });

  return (
    <aside
      className={`fixed top-16 left-4 z-30 transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-11'
      }`}
    >
      {/* Collapse Toggle Handle */}
      <button
        onClick={onToggleOpen}
        className="absolute -right-3 top-4 z-40 w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 shadow-md cursor-pointer transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {isOpen ? (
        <div className="bg-[#0B0E17]/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-5.5rem)] flex flex-col">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Observatory Controls
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">EPOCH J2000</span>
          </div>

          <div className="p-4 space-y-5 overflow-y-auto text-xs">
            {/* 1. Surface Layer Switcher */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-2">
                Cartographic Layer
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    onMapModeChange('realistic');
                    sound.playClick(500);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    mapMode === 'realistic'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Natural Visible
                </button>
                <button
                  onClick={() => {
                    onMapModeChange('topographic');
                    sound.playClick(600);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    mapMode === 'topographic'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LOLA Topography
                </button>
                <button
                  onClick={() => {
                    onMapModeChange('mineral');
                    sound.playClick(700);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    mapMode === 'mineral'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Mineral (UV-VIS)
                </button>
                <button
                  onClick={() => {
                    onMapModeChange('interior');
                    sound.playClick(800);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                    mapMode === 'interior'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Core Cutaway
                </button>
              </div>
            </div>

            {/* 2. Solar Phase & Illumination */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solar Phase</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {currentPhase.name} ({Math.round(sunAngle)}°)
                </span>
              </div>

              {/* Phase Quick Presets */}
              <div className="grid grid-cols-4 gap-1 mb-2.5">
                {MOON_PHASES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSunAngleChange(p.angleDeg);
                      sound.playClick(650);
                    }}
                    className={`py-1 text-[10px] rounded transition-colors cursor-pointer truncate ${
                      Math.abs(p.angleDeg - sunAngle) < 15
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {p.name.replace('Moon', '').trim()}
                  </button>
                ))}
              </div>

              {/* Sun Angle Slider */}
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={sunAngle}
                onChange={(e) => onSunAngleChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              {/* Earthshine Toggle */}
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Earthshine Fill</span>
                <button
                  onClick={onEarthshineToggle}
                  className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                    earthshineEnabled
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {earthshineEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* 3. Spin & Motion Controls */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Orbital Rotation</span>
                </span>
                <button
                  onClick={onAutoSpinToggle}
                  className="flex items-center gap-1 text-[10px] font-medium text-slate-300 hover:text-cyan-400 cursor-pointer"
                >
                  {autoSpin ? <Pause className="w-3 h-3 text-cyan-400" /> : <Play className="w-3 h-3 text-slate-400" />}
                  <span>{autoSpin ? 'Spinning' : 'Paused'}</span>
                </button>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={spinSpeed}
                onChange={(e) => onSpinSpeedChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                <span>Retrograde</span>
                <span>0</span>
                <span>Prograde</span>
              </div>
            </div>

            {/* 4. POI Markers & Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  {showLabels ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Points of Interest</span>
                </span>
                <button
                  onClick={onShowLabelsToggle}
                  className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${
                    showLabels
                      ? 'text-cyan-400 hover:text-cyan-300'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {showLabels ? 'Visible' : 'Hidden'}
                </button>
              </div>

              {showLabels && (
                <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onFilterTypeChange('all')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => onFilterTypeChange('apollo')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                      filterType === 'apollo'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Apollo
                  </button>
                  <button
                    onClick={() => onFilterTypeChange('crater')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                      filterType === 'crater'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Craters
                  </button>
                  <button
                    onClick={() => onFilterTypeChange('mare')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                      filterType === 'mare'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Seas
                  </button>
                </div>
              )}
            </div>

            {/* 5. Terrain Relief Bump Scale */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-400">Terrain Relief Exaggeration</span>
                <span className="text-[10px] font-mono text-slate-400">{Math.round(bumpIntensity * 1000)}x</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.005"
                value={bumpIntensity}
                onChange={(e) => onBumpIntensityChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* 6. Scientific Surface Measurement Tool */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={onToggleMeasurement}
                className={`w-full py-2 px-3 flex items-center justify-between rounded-lg border transition-all cursor-pointer ${
                  measurementActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium">Distance Ruler</span>
                </div>
                <span className="text-[10px] font-mono">
                  {measurementActive ? 'CLICK 2 POINTS' : 'STANDBY'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed Icon Bar */
        <div className="bg-[#0B0E17]/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 flex flex-col items-center gap-3">
          <button
            onClick={onToggleOpen}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
            title="Expand Controls"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      )}
    </aside>
  );
};
