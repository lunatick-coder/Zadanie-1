/**
 * Lunar Explorer Type Definitions
 */

export type FeatureType = 'apollo' | 'crater' | 'mare' | 'basin' | 'mountain';

export interface LunarFeature {
  id: string;
  name: string;
  latinName?: string;
  type: FeatureType;
  lat: number; // degrees (-90 to +90)
  lon: number; // degrees (-180 to +180)
  diameterKm?: number;
  depthKm?: number;
  elevationKm?: number;
  geologicalEra?: string;
  missionYear?: number;
  missionCrew?: string[];
  description: string;
  keyFindings: string[];
  coordinatesFormatted: string;
}

export type MapMode = 'realistic' | 'topographic' | 'mineral' | 'interior';

export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent';

export interface PhasePreset {
  id: MoonPhase;
  name: string;
  angleDeg: number;
  illumination: number; // 0 to 100%
}

export type ViewOrientation = 'near_side' | 'far_side' | 'north_pole' | 'south_pole' | 'apollo_sites';

export interface MeasurementPoint {
  lat: number;
  lon: number;
  x: number;
  y: number;
  z: number;
}
