import { LunarFeature, PhasePreset } from '../types/moon';

export const LUNAR_FEATURES: LunarFeature[] = [
  // Apollo Missions
  {
    id: 'apollo-11',
    name: 'Apollo 11',
    latinName: 'Statio Tranquillitatis',
    type: 'apollo',
    lat: 0.67408,
    lon: 23.47297,
    missionYear: 1969,
    missionCrew: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins'],
    coordinatesFormatted: '0.6741° N, 23.4730° E',
    description: 'First crewed landing on the Moon, touching down at Mare Tranquillitatis on July 20, 1969.',
    keyFindings: [
      'Returned 21.5 kg of lunar regolith and basalt rocks',
      'Deployed Early Apollo Scientific Experiments Package (EASEP)',
      'Installed Lunar Laser Ranging Retroreflector (still active today)',
      'Discovered absence of water and organic compounds in surface dust'
    ]
  },
  {
    id: 'apollo-12',
    name: 'Apollo 12',
    latinName: 'Oceanus Procellarum',
    type: 'apollo',
    lat: -3.01239,
    lon: -23.42157,
    missionYear: 1969,
    missionCrew: ['Pete Conrad', 'Alan Bean', 'Richard Gordon'],
    coordinatesFormatted: '3.0124° S, 23.4216° W',
    description: 'Pinpoint landing mission in Oceanus Procellarum just 160 meters from the robotic Surveyor 3 probe.',
    keyFindings: [
      'Retrieved pieces of Surveyor 3 to evaluate long-term space exposure',
      'Deployed ALSEP surface geophysics station',
      'Confirmed ocean basin basalts are ~3.2 billion years old'
    ]
  },
  {
    id: 'apollo-14',
    name: 'Apollo 14',
    latinName: 'Fra Mauro',
    type: 'apollo',
    lat: -3.64530,
    lon: -17.47136,
    missionYear: 1971,
    missionCrew: ['Alan Shepard', 'Edgar Mitchell', 'Stuart Roosa'],
    coordinatesFormatted: '3.6453° S, 17.4714° W',
    description: 'Targeted the Fra Mauro formation to sample ejecta excavated during the cataclysmic Imbrium impact.',
    keyFindings: [
      'Sampled Cone Crater rim ejecta',
      'Alan Shepard famously struck two golf balls with a modified 6-iron',
      'Returned 42.8 kg of rocks demonstrating intense impact brecciation'
    ]
  },
  {
    id: 'apollo-15',
    name: 'Apollo 15',
    latinName: 'Hadley-Apenninus',
    type: 'apollo',
    lat: 26.13222,
    lon: 3.63386,
    missionYear: 1971,
    missionCrew: ['David Scott', 'James Irwin', 'Alfred Worden'],
    coordinatesFormatted: '26.1322° N, 3.6339° E',
    description: 'First extended "J-mission" featuring the Lunar Roving Vehicle, landing between Hadley Rille and Montes Apenninus.',
    keyFindings: [
      'Discovered the "Genesis Rock" (anorthosite dated to 4.1 billion years)',
      'Demonstrated Galileo hammer-and-feather gravitational drop in vacuum',
      'Explored steep sinuous rilles formed by ancient lava tube collapse'
    ]
  },
  {
    id: 'apollo-16',
    name: 'Apollo 16',
    latinName: 'Descartes Highlands',
    type: 'apollo',
    lat: -8.97301,
    lon: 15.49812,
    missionYear: 1972,
    missionCrew: ['John Young', 'Charlie Duke', 'Ken Mattingly'],
    coordinatesFormatted: '8.9730° S, 15.4981° E',
    description: 'Only mission targeted specifically to sample the central lunar highlands.',
    keyFindings: [
      'Proved lunar highlands are impact breccias rather than volcanic ash domes',
      'Traversed the rim of North Ray Crater (1 km wide, 230 m deep)',
      'Discovered deep anorthositic primary crustal remnants'
    ]
  },
  {
    id: 'apollo-17',
    name: 'Apollo 17',
    latinName: 'Taurus-Littrow',
    type: 'apollo',
    lat: 20.19080,
    lon: 30.77168,
    missionYear: 1972,
    missionCrew: ['Gene Cernan', 'Harrison Schmitt', 'Ronald Evans'],
    coordinatesFormatted: '20.1908° N, 30.7717° E',
    description: 'Final mission of the Apollo program, featuring professional geologist Harrison "Jack" Schmitt.',
    keyFindings: [
      'Discovered iconic orange volcanic glass beads at Shorty Crater',
      'Traversed 35.7 km across Taurus-Littrow valley',
      'Collected 110.5 kg of samples, the largest harvest of any Apollo mission'
    ]
  },

  // Major Craters
  {
    id: 'crater-tycho',
    name: 'Tycho',
    latinName: 'Tycho',
    type: 'crater',
    lat: -43.31,
    lon: -11.36,
    diameterKm: 85,
    depthKm: 4.8,
    geologicalEra: 'Copernican (~108 million years)',
    coordinatesFormatted: '43.31° S, 11.36° W',
    description: 'Prominent young impact crater in the southern lunar highlands featuring dramatic rays stretching over 1,500 km.',
    keyFindings: [
      'One of the best-preserved complex impact craters on the Moon',
      'Sharp central peak rising 1.6 km above the crater floor',
      'Rays visible to the naked eye from Earth during full moon'
    ]
  },
  {
    id: 'crater-copernicus',
    name: 'Copernicus',
    latinName: 'Copernicus',
    type: 'crater',
    lat: 9.62,
    lon: -20.08,
    diameterKm: 93,
    depthKm: 3.8,
    geologicalEra: 'Copernican (~800 million years)',
    coordinatesFormatted: '9.62° N, 20.08° W',
    description: 'The prototypical complex lunar crater, positioned in eastern Oceanus Procellarum with multiple tiered wall terraces.',
    keyFindings: [
      'Triple central peak cluster reaching 1.2 km high',
      'Intricate slumped inner terrace walls',
      'Ejecta blanket clearly defines the boundary of the Copernican geological era'
    ]
  },
  {
    id: 'crater-aristarchus',
    name: 'Aristarchus',
    latinName: 'Aristarchus',
    type: 'crater',
    lat: 23.7,
    lon: -47.4,
    diameterKm: 40,
    depthKm: 3.7,
    geologicalEra: 'Copernican (~450 million years)',
    coordinatesFormatted: '23.7° N, 47.4° W',
    description: 'Brightest large geological feature on the lunar surface, situated on an elevated volcanic plateau.',
    keyFindings: [
      'Albedo almost double that of average lunar terrain',
      'Frequent site of Transient Lunar Phenomena (TLP) and radon-222 gas emissions',
      'Neighbor to Vallis Schröteri, the Moon\'s largest sinuous rille'
    ]
  },
  {
    id: 'crater-kepler',
    name: 'Kepler',
    latinName: 'Kepler',
    type: 'crater',
    lat: 8.1,
    lon: -38.0,
    diameterKm: 31,
    depthKm: 2.6,
    geologicalEra: 'Copernican',
    coordinatesFormatted: '8.1° N, 38.0° W',
    description: 'Prominent bright-rayed crater lying between Oceanus Procellarum and Mare Insularum.',
    keyFindings: [
      'High-albedo ray pattern overlapping the rays of Copernicus',
      'Well-developed hummocky ejecta rim',
      'Distinctive diamond-shaped polygonal rim structure'
    ]
  },
  {
    id: 'crater-plato',
    name: 'Plato',
    latinName: 'Plato',
    type: 'crater',
    lat: 51.6,
    lon: -9.3,
    diameterKm: 101,
    depthKm: 1.0,
    geologicalEra: 'Upper Imbrian',
    coordinatesFormatted: '51.6° N, 9.3° W',
    description: 'Striking dark-floored circular crater bordering the northern shore of Mare Imbrium.',
    keyFindings: [
      'Completely filled by dark basaltic lava giving it an unusually low albedo floor',
      'Jagged western rim casts sharp dagger-like shadows at lunar sunrise',
      'Often called "The Black Lake" in historical selenography'
    ]
  },
  {
    id: 'crater-shackleton',
    name: 'Shackleton Crater',
    latinName: 'Shackleton',
    type: 'crater',
    lat: -89.9,
    lon: 0.0,
    diameterKm: 21,
    depthKm: 4.2,
    geologicalEra: 'Eratosthenian',
    coordinatesFormatted: '89.9° S, 0.0° E',
    description: 'Impact crater positioned almost exactly at the Lunar South Pole, with interior floors in permanent shadow.',
    keyFindings: [
      'Contains significant concentrations of subsurface water ice volatile deposits',
      'Rim peaks receive near-permanent solar illumination ("Peaks of Eternal Light")',
      'Prime target for NASA Artemis and international permanent lunar base habitats'
    ]
  },
  {
    id: 'crater-tsiolkovsky',
    name: 'Tsiolkovsky',
    latinName: 'Tsiolkovskiy',
    type: 'crater',
    lat: -20.4,
    lon: 129.1,
    diameterKm: 185,
    depthKm: 3.2,
    geologicalEra: 'Upper Imbrian',
    coordinatesFormatted: '20.4° S, 129.1° E',
    description: 'One of the most striking features on the lunar far side, with an intensely dark basalt floor surrounded by bright highlands.',
    keyFindings: [
      'First photographed by Soviet Luna 3 probe in 1959',
      'Prominent high-albedo central peak rising over 3.2 km above the dark basalt',
      'Rare example of localized volcanism on the thicker far-side crust'
    ]
  },
  {
    id: 'crater-jackson',
    name: 'Jackson',
    latinName: 'Jackson',
    type: 'crater',
    lat: 22.4,
    lon: -163.1,
    diameterKm: 71,
    depthKm: 3.5,
    geologicalEra: 'Copernican',
    coordinatesFormatted: '22.4° N, 163.1° W',
    description: 'The Tycho of the lunar far side; spectacular bright ray system spanning across the entire northwestern farside hemisphere.',
    keyFindings: [
      'Asymmetric butterfly ray pattern indicating oblique impact trajectory',
      'Central peak composed of excavated anorthositic lower crust',
      'Never visible from Earth due to tidal locking'
    ]
  },

  // Maria (Lunar Seas)
  {
    id: 'mare-tranquillitatis',
    name: 'Mare Tranquillitatis',
    latinName: 'Sea of Tranquility',
    type: 'mare',
    lat: 8.5,
    lon: 31.4,
    diameterKm: 873,
    geologicalEra: 'Upper Imbrian (~3.6–3.8 Ga)',
    coordinatesFormatted: '8.5° N, 31.4° E',
    description: 'Vast, irregular basaltic lunar sea famous for having host to humanity\'s first footsteps on another celestial body.',
    keyFindings: [
      'Remarkably rich in ilmenite (iron-titanium oxide)',
      'Distinctive bluish cast compared to adjacent mare basalts',
      'Irregular multi-ring basin without a pronounced mascon gravity center'
    ]
  },
  {
    id: 'mare-imbrium',
    name: 'Mare Imbrium',
    latinName: 'Sea of Showers / Rains',
    type: 'mare',
    lat: 32.8,
    lon: -15.6,
    diameterKm: 1123,
    geologicalEra: 'Early Imbrian (~3.85 Ga)',
    coordinatesFormatted: '32.8° N, 15.6° W',
    description: 'Second largest mare on the Moon, created when a proto-planet roughly 250 km in diameter struck early in lunar history.',
    keyFindings: [
      'Ringed by three concentric mountain arcs including Montes Apenninus',
      'Massive positive gravity anomaly (mascon) in the center',
      'Excavated debris blanket covering more than 10% of the entire Moon'
    ]
  },
  {
    id: 'mare-serenitatis',
    name: 'Mare Serenitatis',
    latinName: 'Sea of Serenity',
    type: 'mare',
    lat: 28.0,
    lon: 17.5,
    diameterKm: 707,
    geologicalEra: 'Nectarian (~3.87 Ga)',
    coordinatesFormatted: '28.0° N, 17.5° E',
    description: 'Nearly circular impact basin with dark border basalts and complex wrinkle ridges (dorsa).',
    keyFindings: [
      'Home to Apollo 17 landing site in Taurus-Littrow on its eastern perimeter',
      'Strongly defined mascon basin causing subtle orbital satellite perturbations',
      'Clear stratigraphy showing multiple episodic lava flooding events'
    ]
  },
  {
    id: 'oceanus-procellarum',
    name: 'Oceanus Procellarum',
    latinName: 'Ocean of Storms',
    type: 'mare',
    lat: 18.4,
    lon: -57.4,
    diameterKm: 2568,
    geologicalEra: 'Procellarum KREEP Terrane',
    coordinatesFormatted: '18.4° N, 57.4° W',
    description: 'The largest lunar mare, covering more than 4,000,000 km² and spanning across most of the western near side.',
    keyFindings: [
      'Enriched in heat-producing radioactive elements: Potassium (K), Rare Earth Elements (REE), Phosphorus (P)',
      'Subsurface rift valley boundaries discovered by NASA GRAIL mission',
      'Site of Apollo 12, Surveyor, and China Chang\'e 5 lunar sample return'
    ]
  },
  {
    id: 'mare-crisium',
    name: 'Mare Crisium',
    latinName: 'Sea of Crises',
    type: 'mare',
    lat: 17.0,
    lon: 59.1,
    diameterKm: 555,
    geologicalEra: 'Nectarian (~3.89 Ga)',
    coordinatesFormatted: '17.0° N, 59.1° E',
    description: 'Isolated oval-shaped basalt plain near the eastern lunar limb, easily recognized by naked-eye stargazers.',
    keyFindings: [
      'Floored by dense layered lava plains up to 2.9 km thick',
      'Landing site of Soviet robotic sample return missions Luna 15, 20, and 24',
      'Luna 24 verified presence of water in lunar soil samples in 1976'
    ]
  },

  // Giant Basins & Mountain Ranges
  {
    id: 'basin-south-pole-aitken',
    name: 'South Pole–Aitken Basin',
    latinName: 'SPA Basin',
    type: 'basin',
    lat: -53.0,
    lon: 169.0,
    diameterKm: 2500,
    depthKm: 8.2,
    geologicalEra: 'Pre-Nectarian (~4.3 Ga)',
    coordinatesFormatted: '53.0° S, 169.0° E',
    description: 'One of the deepest and largest verified impact structures in the entire Solar System, dominating the southern far side.',
    keyFindings: [
      'Crust excavated down to the Moon\'s lower crust and upper mantle',
      'Landing site of China\'s Chang\'e 4 (first landing on the far side in Von Kármán crater) and Chang\'e 6 (first sample return)',
      'Depression drops more than 8 kilometers below the lunar datum'
    ]
  },
  {
    id: 'montes-apenninus',
    name: 'Montes Apenninus',
    latinName: 'Apennine Mountains',
    type: 'mountain',
    lat: 18.9,
    lon: -3.7,
    diameterKm: 600,
    elevationKm: 5.4,
    geologicalEra: 'Early Imbrian',
    coordinatesFormatted: '18.9° N, 3.7° W',
    description: 'Dramatic crescent mountain chain forming the southeastern rim of the giant Mare Imbrium basin.',
    keyFindings: [
      'Highest peaks rise up to 5.4 kilometers above the adjacent basalt plain',
      'Explored at base by Apollo 15 astronauts David Scott and James Irwin',
      'Exposes ancient pre-Imbrian anorthositic bedrock'
    ]
  }
];

export const MOON_PHASES: PhasePreset[] = [
  { id: 'new_moon', name: 'New Moon', angleDeg: 180, illumination: 0 },
  { id: 'waxing_crescent', name: 'Waxing Crescent', angleDeg: 135, illumination: 25 },
  { id: 'first_quarter', name: 'First Quarter', angleDeg: 90, illumination: 50 },
  { id: 'waxing_gibbous', name: 'Waxing Gibbous', angleDeg: 45, illumination: 75 },
  { id: 'full_moon', name: 'Full Moon', angleDeg: 0, illumination: 100 },
  { id: 'waning_gibbous', name: 'Waning Gibbous', angleDeg: 315, illumination: 75 },
  { id: 'third_quarter', name: 'Third Quarter', angleDeg: 270, illumination: 50 },
  { id: 'waning_crescent', name: 'Waning Crescent', angleDeg: 225, illumination: 25 },
];

export const LUNAR_FACTS = {
  equatorialDiameterKm: 3474.8,
  polarDiameterKm: 3472.0,
  massKg: '7.342 × 10²²',
  massEarthPercent: 1.23,
  surfaceGravityMs2: 1.62,
  surfaceGravityEarthPercent: 16.6,
  averageDistanceKm: 384400,
  orbitalPeriodDays: 27.32,
  surfaceTempMinC: -130,
  surfaceTempMaxC: 120,
  albedo: 0.12,
  crustThicknessKm: '34 – 60 km',
  coreRadiusKm: '~330 km'
};
