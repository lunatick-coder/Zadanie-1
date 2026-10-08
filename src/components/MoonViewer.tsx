import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { LunarFeature, MapMode, MoonPhase } from '../types/moon';
import { LUNAR_FEATURES, MOON_PHASES } from '../data/moonFeatures';
import { generateLunarMaps, createStarfield } from '../utils/textureGenerator';
import { sound } from '../utils/audio';

interface MoonViewerProps {
  mapMode: MapMode;
  sunAngle: number;
  earthshineEnabled: boolean;
  autoSpin: boolean;
  spinSpeed: number;
  selectedFeature: LunarFeature | null;
  onSelectFeature: (feature: LunarFeature | null) => void;
  showLabels: boolean;
  filterType: string;
  onCoordinatesHover: (lat: number | null, lon: number | null) => void;
  measurementActive: boolean;
  onMeasurementResult: (km: number | null) => void;
  roughness: number;
  bumpIntensity: number;
}

// Convert Lat/Lon to 3D Cartesian coordinates on sphere of radius R
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian coordinates on sphere to Lat/Lon
function vector3ToLatLon(vec: THREE.Vector3): { lat: number; lon: number } {
  const norm = vec.clone().normalize();
  const lat = 90 - Math.acos(norm.y) * (180 / Math.PI);
  let lon = (Math.atan2(norm.z, -norm.x) * (180 / Math.PI)) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

// Calculate Great Circle Distance in Kilometers
function calculateGreatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 1737.4; // Lunar mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MoonViewer: React.FC<MoonViewerProps> = ({
  mapMode,
  sunAngle,
  earthshineEnabled,
  autoSpin,
  spinSpeed,
  selectedFeature,
  onSelectFeature,
  showLabels,
  filterType,
  onCoordinatesHover,
  measurementActive,
  onMeasurementResult,
  roughness,
  bumpIntensity,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moonGroupRef = useRef<THREE.Group | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const interiorGroupRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const earthshineLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const measurementGroupRef = useRef<THREE.Group | null>(null);

  // Textures cache
  const texturesRef = useRef<{
    diffuseMap: THREE.CanvasTexture;
    bumpMap: THREE.CanvasTexture;
    topographicMap: THREE.CanvasTexture;
    mineralMap: THREE.CanvasTexture;
  } | null>(null);

  // Interaction State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(4.8);
  const targetCameraDistanceRef = useRef(4.8);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const targetCameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isAnimatingCameraRef = useRef(false);

  // Measurement points
  const measurePointsRef = useRef<THREE.Vector3[]>([]);

  // Hovered feature for pin tooltip
  const [hoveredFeature, setHoveredFeature] = useState<{
    feature: LunarFeature;
    screenX: number;
    screenY: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1500);
    camera.position.set(0, 0, 4.8);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Starfield & Cosmic Void
    const starfield = createStarfield(3500, 700);
    scene.add(starfield);

    // 5. Lighting
    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 0, 10);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Ambient space light (very subtle space darkness)
    const ambientLight = new THREE.AmbientLight(0x0c0e14, 0.35);
    scene.add(ambientLight);

    // Earthshine Light (subtle cool blue reflection)
    const earthshineLight = new THREE.DirectionalLight(0x3866aa, 0.45);
    earthshineLight.position.set(-8, 2, -6);
    scene.add(earthshineLight);
    earthshineLightRef.current = earthshineLight;

    // 6. Moon Container Group
    const moonGroup = new THREE.Group();
    scene.add(moonGroup);
    moonGroupRef.current = moonGroup;

    // 7. Generate procedural high-resolution textures
    const textures = generateLunarMaps(2048, 1024);
    texturesRef.current = textures;

    // 8. Moon Mesh Sphere (Radius = 1.6)
    const moonGeometry = new THREE.SphereGeometry(1.6, 96, 96);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: textures.diffuseMap,
      bumpMap: textures.bumpMap,
      bumpScale: 0.045,
      roughness: 0.88,
      metalness: 0.04,
    });

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonGroup.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // 9. Geological Interior Cutaway Model
    const interiorGroup = new THREE.Group();
    moonGroup.add(interiorGroup);
    interiorGroupRef.current = interiorGroup;
    interiorGroup.visible = false;

    // Build the cutaway interior layers
    const createInteriorModel = () => {
      // Quarter cut outer crust (270 degree arc sphere)
      const crustGeom = new THREE.SphereGeometry(
        1.6,
        64,
        64,
        0,
        Math.PI * 1.5, // 270 degree opening
        0,
        Math.PI
      );
      const crustMat = new THREE.MeshStandardMaterial({
        map: textures.diffuseMap,
        bumpMap: textures.bumpMap,
        bumpScale: 0.04,
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
      const crustCutaway = new THREE.Mesh(crustGeom, crustMat);
      interiorGroup.add(crustCutaway);

      // Interior Flat Cross-Section Plates (XY and YZ planes in quadrant)
      const flatMatCrust = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.9 });
      const flatMatMantle = new THREE.MeshStandardMaterial({ color: 0x4a5d3c, roughness: 0.7 });
      const flatMatPartialMelt = new THREE.MeshStandardMaterial({ color: 0xc45525, roughness: 0.5 });
      const flatMatCore = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.6,
        roughness: 0.25,
        emissive: 0x5a3000,
      });

      // Mantle sphere (Radius = 1.4)
      const mantleGeom = new THREE.SphereGeometry(1.4, 48, 48, 0, Math.PI * 1.5, 0, Math.PI);
      const mantleMesh = new THREE.Mesh(mantleGeom, flatMatMantle);
      interiorGroup.add(mantleMesh);

      // Partial Melt Zone (Radius = 0.6)
      const meltGeom = new THREE.SphereGeometry(0.55, 32, 32, 0, Math.PI * 1.5, 0, Math.PI);
      const meltMesh = new THREE.Mesh(meltGeom, flatMatPartialMelt);
      interiorGroup.add(meltMesh);

      // Solid & Fluid Core (Radius = 0.3)
      const coreGeom = new THREE.SphereGeometry(0.32, 32, 32);
      const coreMesh = new THREE.Mesh(coreGeom, flatMatCore);
      interiorGroup.add(coreMesh);
    };
    createInteriorModel();

    // 10. POI Pins Group
    const pinsGroup = new THREE.Group();
    moonGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // 11. Measurement Lines Group
    const measurementGroup = new THREE.Group();
    moonGroup.add(measurementGroup);
    measurementGroupRef.current = measurementGroup;

    setIsLoading(false);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera zoom damping
      cameraDistanceRef.current += (targetCameraDistanceRef.current - cameraDistanceRef.current) * 0.12;

      // Handle programmatic fly-to animation
      if (isAnimatingCameraRef.current && targetCameraPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPosRef.current, 0.06);
        cameraRef.current.lookAt(targetCameraLookAtRef.current);

        if (cameraRef.current.position.distanceTo(targetCameraPosRef.current) < 0.05) {
          isAnimatingCameraRef.current = false;
        }
      } else if (cameraRef.current) {
        // Normal orbital camera distance positioning
        const camDir = cameraRef.current.position.clone().normalize();
        cameraRef.current.position.copy(camDir.multiplyScalar(cameraDistanceRef.current));
      }

      // Smooth rotation inertia & auto-spin
      if (moonGroupRef.current) {
        if (!isDraggingRef.current) {
          if (autoSpin) {
            moonGroupRef.current.rotation.y += spinSpeed * 0.005;
          }

          // Apply rotation inertia damping
          moonGroupRef.current.rotation.y += rotationVelocityRef.current.x;
          moonGroupRef.current.rotation.x += rotationVelocityRef.current.y;

          rotationVelocityRef.current.x *= 0.92;
          rotationVelocityRef.current.y *= 0.92;
        }
      }

      // Billboard orientation for POI pins
      if (pinsGroupRef.current && cameraRef.current) {
        pinsGroupRef.current.children.forEach((child) => {
          if (child.userData.isPin) {
            // Pulse animation for selected pin
            if (child.userData.isSelected) {
              const scale = 1 + Math.sin(clock.getElapsedTime() * 6) * 0.18;
              child.scale.set(scale, scale, scale);
            } else {
              child.scale.set(1, 1, 1);
            }
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Surface Layer Map Mode (Realistic, Topo, Mineral, Interior)
  useEffect(() => {
    if (!moonMeshRef.current || !texturesRef.current || !interiorGroupRef.current) return;
    const textures = texturesRef.current;
    const mesh = moonMeshRef.current;
    const interior = interiorGroupRef.current;

    if (mapMode === 'interior') {
      mesh.visible = false;
      interior.visible = true;
    } else {
      mesh.visible = true;
      interior.visible = false;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mapMode === 'realistic') {
        mat.map = textures.diffuseMap;
        mat.bumpMap = textures.bumpMap;
        mat.bumpScale = bumpIntensity;
      } else if (mapMode === 'topographic') {
        mat.map = textures.topographicMap;
        mat.bumpMap = textures.bumpMap;
        mat.bumpScale = bumpIntensity * 1.3;
      } else if (mapMode === 'mineral') {
        mat.map = textures.mineralMap;
        mat.bumpMap = textures.bumpMap;
        mat.bumpScale = bumpIntensity * 0.8;
      }
      mat.roughness = roughness;
      mat.needsUpdate = true;
    }
  }, [mapMode, bumpIntensity, roughness]);

  // Update Directional Sun Light angle & Earthshine
  useEffect(() => {
    if (!sunLightRef.current || !earthshineLightRef.current) return;
    const rad = (sunAngle * Math.PI) / 180;
    const sunDist = 18;
    sunLightRef.current.position.set(
      Math.sin(rad) * sunDist,
      Math.sin(rad * 0.4) * 3,
      Math.cos(rad) * sunDist
    );

    earthshineLightRef.current.visible = earthshineEnabled;
  }, [sunAngle, earthshineEnabled]);

  // Update POI Pins
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    const pinsGroup = pinsGroupRef.current;

    // Clear existing pins
    while (pinsGroup.children.length > 0) {
      const obj = pinsGroup.children[0];
      pinsGroup.remove(obj);
    }

    if (!showLabels || mapMode === 'interior') return;

    // Filter features
    const filteredFeatures = LUNAR_FEATURES.filter((f) => {
      if (filterType === 'all') return true;
      return f.type === filterType;
    });

    const radius = 1.608; // slightly above moon surface (R=1.60)

    filteredFeatures.forEach((feature) => {
      const pos = latLonToVector3(feature.lat, feature.lon, radius);
      const isSelected = selectedFeature?.id === feature.id;

      // Pin root group
      const pinObj = new THREE.Group();
      pinObj.position.copy(pos);
      // Orient normal to surface
      pinObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

      pinObj.userData = {
        isPin: true,
        feature: feature,
        isSelected: isSelected,
      };

      // Color mapping
      let colorHex = 0x06b6d4; // cyan for crater
      if (feature.type === 'apollo') colorHex = 0xf59e0b; // gold/amber for Apollo
      else if (feature.type === 'mare') colorHex = 0x8b5cf6; // purple/violet for mare
      else if (feature.type === 'basin') colorHex = 0x10b981; // emerald for basin
      else if (feature.type === 'mountain') colorHex = 0xec4899; // pink/rose for mountains

      // Pin stem
      const stemGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.06, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = 0.03;
      pinObj.add(stem);

      // Pin Head / Beacon
      const headGeom = new THREE.SphereGeometry(isSelected ? 0.024 : 0.016, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : colorHex,
      });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.y = 0.06;
      pinObj.add(head);

      // Outer Pulse Ring for selection or apollo
      if (isSelected || feature.type === 'apollo') {
        const ringGeom = new THREE.RingGeometry(0.025, 0.035, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.06;
        pinObj.add(ring);
      }

      pinsGroup.add(pinObj);
    });
  }, [showLabels, filterType, selectedFeature, mapMode]);

  // Smooth Fly-to camera transition when a feature is selected
  useEffect(() => {
    if (!selectedFeature || !moonGroupRef.current || !cameraRef.current) return;

    sound.playClick(600);

    // Calculate target position on Moon in its local coordinates
    const targetSurfacePos = latLonToVector3(selectedFeature.lat, selectedFeature.lon, 1.6);

    // Transform into world space using moon's current rotation
    const worldSurfacePos = targetSurfacePos.clone().applyMatrix4(moonGroupRef.current.matrixWorld);

    // Camera targets ~2.8 units out in direction of that feature
    const camTarget = worldSurfacePos.clone().normalize().multiplyScalar(2.6);

    targetCameraPosRef.current = camTarget;
    targetCameraLookAtRef.current.set(0, 0, 0);
    targetCameraDistanceRef.current = 2.6;
    isAnimatingCameraRef.current = true;
  }, [selectedFeature]);

  // Render Measurement Arc when 2 points are selected
  const updateMeasurementVisuals = useCallback(() => {
    if (!measurementGroupRef.current) return;
    const group = measurementGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const pts = measurePointsRef.current;
    if (pts.length === 0) return;

    // Draw markers for selected points
    pts.forEach((pt, idx) => {
      const markerGeom = new THREE.SphereGeometry(0.02, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : 0xf43f5e,
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.copy(pt.clone().multiplyScalar(1.01));
      group.add(marker);
    });

    // Draw connecting Great Circle Arc
    if (pts.length === 2) {
      const p1 = pts[0].clone().normalize();
      const p2 = pts[1].clone().normalize();

      const curvePoints: THREE.Vector3[] = [];
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Spherical linear interpolation (slerp)
        const v = new THREE.Vector3().copy(p1).lerp(p2, t).normalize().multiplyScalar(1.615);
        curvePoints.push(v);
      }

      const lineGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        linewidth: 3,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      group.add(line);

      // Compute actual surface distance in km
      const c1 = vector3ToLatLon(pts[0]);
      const c2 = vector3ToLatLon(pts[1]);
      const km = calculateGreatCircleKm(c1.lat, c1.lon, c2.lat, c2.lon);
      onMeasurementResult(km);
      sound.playClick(900);
    }
  }, [onMeasurementResult]);

  // Reset measurement if toggled off
  useEffect(() => {
    if (!measurementActive) {
      measurePointsRef.current = [];
      updateMeasurementVisuals();
      onMeasurementResult(null);
    }
  }, [measurementActive, updateMeasurementVisuals, onMeasurementResult]);

  // Pointer & Mouse Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    rotationVelocityRef.current = { x: 0, y: 0 };
    isAnimatingCameraRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !moonMeshRef.current || !moonGroupRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    // 1. If dragging, rotate Moon
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const rotSpeed = 0.005;
      moonGroupRef.current.rotation.y += deltaX * rotSpeed;
      moonGroupRef.current.rotation.x += deltaY * rotSpeed;

      // Limit pitch to prevent upside down flip disorientation
      moonGroupRef.current.rotation.x = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, moonGroupRef.current.rotation.x));

      rotationVelocityRef.current = {
        x: deltaX * rotSpeed * 0.25,
        y: deltaY * rotSpeed * 0.25,
      };

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // 2. Raycaster for live surface coordinates & hover pins
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // Check POI pins hover
    if (pinsGroupRef.current) {
      const pinIntersects = raycaster.intersectObjects(pinsGroupRef.current.children, true);
      if (pinIntersects.length > 0) {
        let rootGroup: THREE.Object3D | null = pinIntersects[0].object;
        while (rootGroup && !rootGroup.userData.feature) {
          rootGroup = rootGroup.parent;
        }

        if (rootGroup && rootGroup.userData.feature) {
          setHoveredFeature({
            feature: rootGroup.userData.feature,
            screenX: e.clientX,
            screenY: e.clientY,
          });
          containerRef.current.style.cursor = 'pointer';
          return;
        }
      }
    }

    setHoveredFeature(null);
    containerRef.current.style.cursor = measurementActive ? 'crosshair' : 'grab';

    // Check Moon surface hover for lat/lon probe
    const intersects = raycaster.intersectObject(moonMeshRef.current);
    if (intersects.length > 0) {
      const localPoint = intersects[0].point.clone();
      // Invert moon group rotation to get static lunar surface coordinates
      moonGroupRef.current.worldToLocal(localPoint);
      const coords = vector3ToLatLon(localPoint);
      onCoordinatesHover(coords.lat, coords.lon);
    } else {
      onCoordinatesHover(null, null);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Click on Moon / POI
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !moonMeshRef.current || !moonGroupRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // 1. If in Measurement Mode, register point
    if (measurementActive) {
      const surfaceHits = raycaster.intersectObject(moonMeshRef.current);
      if (surfaceHits.length > 0) {
        const localPt = surfaceHits[0].point.clone();
        moonGroupRef.current.worldToLocal(localPt);

        if (measurePointsRef.current.length >= 2) {
          measurePointsRef.current = [localPt];
        } else {
          measurePointsRef.current.push(localPt);
        }
        updateMeasurementVisuals();
        sound.playClick(750);
      }
      return;
    }

    // 2. POI Pin Click
    if (pinsGroupRef.current) {
      const pinIntersects = raycaster.intersectObjects(pinsGroupRef.current.children, true);
      if (pinIntersects.length > 0) {
        let rootGroup: THREE.Object3D | null = pinIntersects[0].object;
        while (rootGroup && !rootGroup.userData.feature) {
          rootGroup = rootGroup.parent;
        }

        if (rootGroup && rootGroup.userData.feature) {
          onSelectFeature(rootGroup.userData.feature);
          return;
        }
      }
    }

    // 3. Click elsewhere on empty space
    // If clicked empty space, do not deselect immediately if user was just rotating
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.0035;
    const newDist = targetCameraDistanceRef.current + zoomFactor;
    // Bound camera zoom between 2.1 (close crater inspection) and 10.0 (wide space overview)
    targetCameraDistanceRef.current = Math.max(2.05, Math.min(10.0, newDist));
    isAnimatingCameraRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#05070B] text-slate-300">
          <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin mb-4" />
          <p className="text-sm font-medium tracking-wide">Synthesizing Lunar Geometry & Topography...</p>
        </div>
      )}

      {/* Hover Tooltip for POI Pins */}
      {hoveredFeature && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-left transform -translate-x-1/2 -translate-y-full -mt-3 animate-fade-in"
          style={{ left: hoveredFeature.screenX, top: hoveredFeature.screenY }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredFeature.feature.type === 'apollo'
                  ? 'bg-amber-400'
                  : hoveredFeature.feature.type === 'crater'
                  ? 'bg-cyan-400'
                  : hoveredFeature.feature.type === 'mare'
                  ? 'bg-purple-400'
                  : 'bg-emerald-400'
              }`}
            />
            <p className="text-xs font-semibold text-white tracking-wide">{hoveredFeature.feature.name}</p>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{hoveredFeature.feature.coordinatesFormatted}</p>
          {hoveredFeature.feature.diameterKm && (
            <p className="text-[10px] text-slate-400">Ø {hoveredFeature.feature.diameterKm} km</p>
          )}
        </div>
      )}
    </div>
  );
};
