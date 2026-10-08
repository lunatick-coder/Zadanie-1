/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { MoonViewer } from './components/MoonViewer';
import { TopNav } from './components/TopNav';
import { SidebarControls } from './components/SidebarControls';
import { FeatureDossier } from './components/FeatureDossier';
import { FeatureCatalog } from './components/FeatureCatalog';
import { TelemetryBar } from './components/TelemetryBar';
import { LunarFeature, MapMode } from './types/moon';
import { LUNAR_FEATURES } from './data/moonFeatures';
import { sound } from './utils/audio';

export default function App() {
  const [mapMode, setMapMode] = useState<MapMode>('realistic');
  const [sunAngle, setSunAngle] = useState<number>(45);
  const [earthshineEnabled, setEarthshineEnabled] = useState<boolean>(true);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [spinSpeed, setSpinSpeed] = useState<number>(0.15);
  const [selectedFeature, setSelectedFeature] = useState<LunarFeature | null>(null);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [hoverLat, setHoverLat] = useState<number | null>(null);
  const [hoverLon, setHoverLon] = useState<number | null>(null);
  const [measurementActive, setMeasurementActive] = useState<boolean>(false);
  const [measuredKm, setMeasuredKm] = useState<number | null>(null);
  const [bumpIntensity, setBumpIntensity] = useState<number>(0.045);
  const [roughness, setRoughness] = useState<number>(0.88);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [catalogOpen, setCatalogOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Quick view jumps
  const handleQuickView = useCallback((view: 'near_side' | 'far_side' | 'south_pole' | 'north_pole' | 'apollo') => {
    sound.playClick(700);
    if (view === 'apollo') {
      const apollo11 = LUNAR_FEATURES.find((f) => f.id === 'apollo-11');
      if (apollo11) setSelectedFeature(apollo11);
    } else if (view === 'south_pole') {
      const shackleton = LUNAR_FEATURES.find((f) => f.id === 'crater-shackleton');
      if (shackleton) setSelectedFeature(shackleton);
    } else if (view === 'far_side') {
      const tsiolkovsky = LUNAR_FEATURES.find((f) => f.id === 'crater-tsiolkovsky');
      if (tsiolkovsky) setSelectedFeature(tsiolkovsky);
    } else if (view === 'near_side') {
      const copernicus = LUNAR_FEATURES.find((f) => f.id === 'crater-copernicus');
      if (copernicus) setSelectedFeature(copernicus);
    }
  }, []);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    sound.playClick(500);
    setSelectedFeature(null);
  }, []);

  // Take High-Res Canvas Snapshot
  const handleTakeSnapshot = useCallback(() => {
    sound.playClick(1000);
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `luna-3d-observation-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // In case of security restrictions
    }
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#05070B] select-none">
      {/* 1. Header Navigation Bar */}
      <TopNav
        onQuickView={handleQuickView}
        onResetCamera={handleResetCamera}
        onTakeSnapshot={handleTakeSnapshot}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenCatalog={() => setCatalogOpen(true)}
      />

      {/* 2. Interactive 3D WebGL Canvas */}
      <div className="absolute inset-0 z-10">
        <MoonViewer
          mapMode={mapMode}
          sunAngle={sunAngle}
          earthshineEnabled={earthshineEnabled}
          autoSpin={autoSpin}
          spinSpeed={spinSpeed}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
          showLabels={showLabels}
          filterType={filterType}
          onCoordinatesHover={(lat, lon) => {
            setHoverLat(lat);
            setHoverLon(lon);
          }}
          measurementActive={measurementActive}
          onMeasurementResult={setMeasuredKm}
          roughness={roughness}
          bumpIntensity={bumpIntensity}
        />
      </div>

      {/* 3. Left Controls Sidebar */}
      <SidebarControls
        mapMode={mapMode}
        onMapModeChange={setMapMode}
        sunAngle={sunAngle}
        onSunAngleChange={setSunAngle}
        earthshineEnabled={earthshineEnabled}
        onEarthshineToggle={() => setEarthshineEnabled((prev) => !prev)}
        autoSpin={autoSpin}
        onAutoSpinToggle={() => setAutoSpin((prev) => !prev)}
        spinSpeed={spinSpeed}
        onSpinSpeedChange={setSpinSpeed}
        showLabels={showLabels}
        onShowLabelsToggle={() => setShowLabels((prev) => !prev)}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        measurementActive={measurementActive}
        onToggleMeasurement={() => {
          setMeasurementActive((prev) => !prev);
          sound.playClick(800);
        }}
        bumpIntensity={bumpIntensity}
        onBumpIntensityChange={setBumpIntensity}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
      />

      {/* 4. Right Feature Dossier Panel */}
      <FeatureDossier
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onFocus={(f) => {
          setSelectedFeature({ ...f });
        }}
      />

      {/* 5. Feature Catalog Modal */}
      <FeatureCatalog
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onSelectFeature={(feature) => {
          setSelectedFeature(feature);
        }}
      />

      {/* 6. Bottom Telemetry & Coordinate Ribbon */}
      <TelemetryBar
        hoverLat={hoverLat}
        hoverLon={hoverLon}
        sunAngle={sunAngle}
        measuredKm={measuredKm}
        measurementActive={measurementActive}
        onClearMeasurement={() => setMeasuredKm(null)}
      />
    </main>
  );
}
