import React from 'react';
import { RotateCcw, Camera, Volume2, VolumeX, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopNavProps {
  onQuickView: (view: 'near_side' | 'far_side' | 'south_pole' | 'north_pole' | 'apollo') => void;
  onResetCamera: () => void;
  onTakeSnapshot: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenCatalog: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onQuickView,
  onResetCamera,
  onTakeSnapshot,
  isMuted,
  onToggleSound,
  onOpenCatalog,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-[#05070B]/80 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-bold tracking-wider text-slate-100 uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Luna 3D
        </a>
        <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border-l border-slate-700/80 pl-3">
          1:1 Interactive Selenological Model
        </span>
      </div>

      {/* Zone 2: Clean navigation presets */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => onQuickView('near_side')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Near Side
        </button>
        <button
          onClick={() => onQuickView('far_side')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          Far Side
        </button>
        <button
          onClick={() => onQuickView('south_pole')}
          className="hover:text-cyan-400 transition-colors cursor-pointer"
        >
          South Pole (Artemis)
        </button>
        <button
          onClick={() => onQuickView('apollo')}
          className="hover:text-amber-400 transition-colors cursor-pointer"
        >
          Apollo Sites
        </button>
        <button
          onClick={onOpenCatalog}
          className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Feature Index</span>
        </button>
      </nav>

      {/* Zone 3: Primary functional actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        <button
          onClick={onTakeSnapshot}
          title="Capture High-Res View"
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset View</span>
        </button>
      </div>
    </header>
  );
};
