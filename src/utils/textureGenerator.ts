import * as THREE from 'three';
import { LUNAR_FEATURES } from '../data/moonFeatures';

/**
 * Procedural Lunar Surface Texture Generator
 * Produces high-fidelity equirectangular maps for Three.js SphereGeometry
 */

interface GeneratedTextures {
  diffuseMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  topographicMap: THREE.CanvasTexture;
  mineralMap: THREE.CanvasTexture;
}

// Convert lat/lon in degrees to equirectangular pixel coordinates
function latLonToPixel(lat: number, lon: number, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

// Approximate angular distance in pixels, accounting for latitude compression
function kmToPixelRadius(km: number, lat: number, width: number, height: number): { rx: number; ry: number } {
  const moonCircumferenceKm = 10921; // ~3474.8 * pi
  const latFactor = Math.cos((lat * Math.PI) / 180);
  const ry = (km / (moonCircumferenceKm / 2)) * height;
  const rx = (km / (moonCircumferenceKm * Math.max(0.15, latFactor))) * width;
  return { rx: Math.max(1.5, rx), ry: Math.max(1.5, ry) };
}

// Simple seeded pseudo-random noise generator
function pseudoNoise(x: number, y: number, seed: number = 42): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453123;
  return n - Math.floor(n);
}

// Smooth noise generator
function smoothNoise(x: number, y: number, scale: number): number {
  const nx = x / scale;
  const ny = y / scale;
  const x0 = Math.floor(nx);
  const y0 = Math.floor(ny);
  const fx = nx - x0;
  const fy = ny - y0;
  const sfx = fx * fx * (3 - 2 * fx);
  const sfy = fy * fy * (3 - 2 * fy);

  const n00 = pseudoNoise(x0, y0);
  const n10 = pseudoNoise(x0 + 1, y0);
  const n01 = pseudoNoise(x0, y0 + 1);
  const n11 = pseudoNoise(x0 + 1, y0 + 1);

  const ix0 = n00 * (1 - sfx) + n10 * sfx;
  const ix1 = n01 * (1 - sfx) + n11 * sfx;
  return ix0 * (1 - sfy) + ix1 * sfy;
}

// Fractal Brownian Motion (fBM)
function fbm(x: number, y: number, octaves: number = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 64;
  for (let i = 0; i < octaves; i++) {
    val += smoothNoise(x, y, freq) * amp;
    amp *= 0.5;
    freq *= 0.5;
  }
  return val;
}

export function generateLunarMaps(width = 2048, height = 1024): GeneratedTextures {
  // 1. Realistic Diffuse Canvas
  const diffuseCanvas = document.createElement('canvas');
  diffuseCanvas.width = width;
  diffuseCanvas.height = height;
  const diffuseCtx = diffuseCanvas.getContext('2d')!;

  // 2. Bump Map Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  // 3. Topographic LOLA Canvas
  const topoCanvas = document.createElement('canvas');
  topoCanvas.width = width;
  topoCanvas.height = height;
  const topoCtx = topoCanvas.getContext('2d')!;

  // 4. Mineral / Clementine UV-VIS Canvas
  const minCanvas = document.createElement('canvas');
  minCanvas.width = width;
  minCanvas.height = height;
  const minCtx = minCanvas.getContext('2d')!;

  // Step 1: Base Highlands & Noise
  // Base highland anorthosite is pale gray (approx RGB 175, 175, 180)
  const diffuseImg = diffuseCtx.createImageData(width, height);
  const bumpImg = bumpCtx.createImageData(width, height);
  const topoImg = topoCtx.createImageData(width, height);
  const minImg = minCtx.createImageData(width, height);

  const dData = diffuseImg.data;
  const bData = bumpImg.data;
  const tData = topoImg.data;
  const mData = minImg.data;

  // Elevation base map: Highlands are generally +1 to +4km, Farside is +2 to +6km
  for (let y = 0; y < height; y++) {
    const lat = 90 - (y / height) * 180;
    const latRad = (lat * Math.PI) / 180;

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 360 - 180;
      const idx = (y * width + x) * 4;

      // Base noise
      const n1 = fbm(x, y, 4);
      const n2 = pseudoNoise(x, y, 101);

      // Farside is brighter and has thicker crust / higher elevation
      const isFarSide = Math.abs(lon) > 90;
      const farSideFactor = isFarSide ? 1.12 : 1.0;

      // Diffuse color: Lunar highlands regolith
      const baseAlbedo = Math.floor((155 + n1 * 40 + n2 * 10) * farSideFactor);
      const clampedAlbedo = Math.min(240, Math.max(40, baseAlbedo));
      dData[idx] = clampedAlbedo;
      dData[idx + 1] = clampedAlbedo;
      dData[idx + 2] = Math.min(240, clampedAlbedo + 2); // slight cool gray
      dData[idx + 3] = 255;

      // Bump height: 128 is baseline 0 km datum
      // Far side is elevated (+2 to +5km), near side highlands are (+1km)
      let heightVal = 135 + (n1 - 0.5) * 35;
      if (isFarSide) heightVal += 18;
      bData[idx] = heightVal;
      bData[idx + 1] = heightVal;
      bData[idx + 2] = heightVal;
      bData[idx + 3] = 255;

      // Topographic Map Base (LOLA palette: Green/Yellow for average highlands)
      // Elevation approx 0 to +4 km -> Green to Yellow
      tData[idx] = Math.floor(130 + n1 * 50); // R
      tData[idx + 1] = Math.floor(190 + n1 * 30); // G
      tData[idx + 2] = Math.floor(70 + n1 * 40); // B
      tData[idx + 3] = 255;

      // Mineral Map Base (Anorthositic highland = pale beige/buff yellow in Clementine UV-VIS)
      mData[idx] = Math.floor(175 + n1 * 25);
      mData[idx + 1] = Math.floor(165 + n1 * 25);
      mData[idx + 2] = Math.floor(125 + n1 * 20);
      mData[idx + 3] = 255;
    }
  }

  diffuseCtx.putImageData(diffuseImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  topoCtx.putImageData(topoImg, 0, 0);
  minCtx.putImageData(minImg, 0, 0);

  // Helper to draw a lunar mare (dark basalt plain)
  const drawMare = (
    lat: number,
    lon: number,
    diameterKm: number,
    irregularity: number = 0.25,
    isHighTitanium: boolean = false
  ) => {
    const [cx, cy] = latLonToPixel(lat, lon, width, height);
    const { rx, ry } = kmToPixelRadius(diameterKm / 2, lat, width, height);

    // We draw onto each canvas with blend modes and radial gradients
    const drawToContext = (
      ctx: CanvasRenderingContext2D,
      colorCenter: string,
      colorEdge: string,
      blend: GlobalCompositeOperation = 'source-over'
    ) => {
      ctx.save();
      ctx.globalCompositeOperation = blend;

      // Handle wrapping around 180 meridian if near edges
      const offsets = [0];
      if (cx - rx < 0) offsets.push(width);
      if (cx + rx > width) offsets.push(-width);

      for (const offset of offsets) {
        ctx.beginPath();
        const rad = Math.max(rx, ry);
        const grad = ctx.createRadialGradient(cx + offset, cy, 0, cx + offset, cy, rad);
        grad.addColorStop(0, colorCenter);
        grad.addColorStop(0.7, colorCenter);
        grad.addColorStop(1, colorEdge);

        ctx.fillStyle = grad;

        // Draw slightly irregular ellipse
        ctx.beginPath();
        const points = 24;
        for (let i = 0; i <= points; i++) {
          const theta = (i / points) * Math.PI * 2;
          const noise = 1 + (pseudoNoise(i * 1.5, lat) - 0.5) * irregularity;
          const px = cx + offset + Math.cos(theta) * rx * noise;
          const py = cy + Math.sin(theta) * ry * noise;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    // Diffuse: Dark basaltic lava (RGB ~48, 50, 54, with slight warm or blue tint)
    const mareDiffuse = isHighTitanium ? 'rgba(44, 46, 54, 0.88)' : 'rgba(54, 52, 50, 0.86)';
    drawToContext(diffuseCtx, mareDiffuse, 'rgba(120, 120, 120, 0)');

    // Bump: Maria are sunken lowlands (-1 to -3 km elevation) -> darker bump
    drawToContext(bumpCtx, 'rgba(80, 80, 80, 0.85)', 'rgba(135, 135, 135, 0)');

    // Topo: Low elevation is Cyan / Navy Blue in LOLA map
    const topoColor = 'rgba(28, 140, 200, 0.9)';
    drawToContext(topoCtx, topoColor, 'rgba(130, 190, 70, 0)');

    // Mineral: High-titanium is distinct blue/purple in UV-VIS, normal mare is dark orange-brown
    const minColor = isHighTitanium ? 'rgba(56, 92, 178, 0.92)' : 'rgba(168, 98, 42, 0.88)';
    drawToContext(minCtx, minColor, 'rgba(175, 165, 125, 0)');
  };

  // Step 2: Draw the major Lunar Maria accurately
  // Oceanus Procellarum (vast western mare)
  drawMare(18.4, -57.4, 2500, 0.45, false);
  drawMare(25.0, -45.0, 1400, 0.35, true);
  drawMare(5.0, -35.0, 1100, 0.35, false);

  // Mare Imbrium (giant circular basin)
  drawMare(32.8, -15.6, 1150, 0.18, false);

  // Mare Serenitatis
  drawMare(28.0, 17.5, 720, 0.15, true);

  // Mare Tranquillitatis (famous high-titanium blue-tinted mare, Apollo 11)
  drawMare(8.5, 31.4, 880, 0.35, true);

  // Mare Crisium (isolated eastern limb mare)
  drawMare(17.0, 59.1, 560, 0.12, false);

  // Mare Fecunditatis
  drawMare(-7.8, 51.3, 900, 0.3, false);

  // Mare Nectaris
  drawMare(-15.2, 35.5, 350, 0.15, false);

  // Mare Nubium
  drawMare(-21.3, -16.6, 715, 0.25, false);

  // Mare Humorum
  drawMare(-24.4, -38.4, 390, 0.12, true);

  // Mare Vaporum
  drawMare(13.3, 3.6, 245, 0.2, false);

  // Far-side maria (very sparse!):
  // Mare Moscoviense
  drawMare(27.3, 147.9, 275, 0.15, true);
  // Mare Ingenii
  drawMare(-33.7, 163.5, 318, 0.2, false);
  // Tsiolkovsky Crater dark floor
  drawMare(-20.4, 129.1, 200, 0.1, false);

  // South Pole - Aitken Basin (deepest feature on the Moon, -8.2km to -9km)
  {
    const [cx, cy] = latLonToPixel(-53.0, 169.0, width, height);
    const { rx, ry } = kmToPixelRadius(2500 / 2, -53.0, width, height);

    // Bump: deep depression
    bumpCtx.save();
    const bumpGrad = bumpCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    bumpGrad.addColorStop(0, 'rgba(40, 40, 40, 0.9)');
    bumpGrad.addColorStop(1, 'rgba(150, 150, 150, 0)');
    bumpCtx.fillStyle = bumpGrad;
    bumpCtx.beginPath();
    bumpCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    bumpCtx.fill();
    bumpCtx.restore();

    // Topo: Deepest purple / midnight indigo
    topoCtx.save();
    const topoGrad = topoCtx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    topoGrad.addColorStop(0, 'rgba(25, 12, 95, 0.95)');
    topoGrad.addColorStop(0.5, 'rgba(50, 30, 140, 0.85)');
    topoGrad.addColorStop(0.8, 'rgba(20, 90, 180, 0.6)');
    topoGrad.addColorStop(1, 'rgba(130, 190, 70, 0)');
    topoCtx.fillStyle = topoGrad;
    topoCtx.beginPath();
    topoCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    topoCtx.fill();
    topoCtx.restore();
  }

  // Mountain Ranges: Montes Apenninus (dramatic arc around Imbrium)
  {
    const [mx, my] = latLonToPixel(18.9, -3.7, width, height);
    bumpCtx.save();
    bumpCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    bumpCtx.lineWidth = 4;
    bumpCtx.filter = 'blur(2px)';
    bumpCtx.beginPath();
    bumpCtx.arc(mx + 20, my - 25, 45, 0.5 * Math.PI, 1.1 * Math.PI);
    bumpCtx.stroke();
    bumpCtx.restore();

    // Topo high peaks: Red/White (+5km to +10km)
    topoCtx.save();
    topoCtx.strokeStyle = 'rgba(240, 50, 40, 0.85)';
    topoCtx.lineWidth = 5;
    topoCtx.filter = 'blur(1px)';
    topoCtx.beginPath();
    topoCtx.arc(mx + 20, my - 25, 45, 0.5 * Math.PI, 1.1 * Math.PI);
    topoCtx.stroke();
    topoCtx.restore();
  }

  // Step 3: Draw Ray Systems for prominent young craters (Tycho, Copernicus, Kepler, Jackson)
  const drawRaySystem = (lat: number, lon: number, radiusKm: number, rayCount: number = 24, rayIntensity = 0.65) => {
    const [cx, cy] = latLonToPixel(lat, lon, width, height);
    const { rx } = kmToPixelRadius(radiusKm, lat, width, height);

    diffuseCtx.save();
    diffuseCtx.strokeStyle = `rgba(240, 245, 255, ${rayIntensity})`;
    diffuseCtx.lineCap = 'round';

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + (pseudoNoise(i, lat) - 0.5) * 0.2;
      const rayLen = rx * (0.4 + pseudoNoise(i * 3, lon) * 0.8);
      const widthLine = 1 + pseudoNoise(i * 5, 22) * 2.5;

      diffuseCtx.lineWidth = widthLine;
      diffuseCtx.beginPath();
      diffuseCtx.moveTo(cx, cy);

      // Sinuous ray path
      const midDist = rayLen * 0.5;
      const midAngle = angle + (pseudoNoise(i, 88) - 0.5) * 0.15;
      const mx = cx + Math.cos(midAngle) * midDist;
      const my = cy + Math.sin(midAngle) * midDist;

      const endX = cx + Math.cos(angle) * rayLen;
      const endY = cy + Math.sin(angle) * rayLen;

      diffuseCtx.quadraticCurveTo(mx, my, endX, endY);
      diffuseCtx.stroke();
    }
    diffuseCtx.restore();

    // In Mineral map, fresh rays are bright cyan-white
    minCtx.save();
    minCtx.strokeStyle = `rgba(180, 230, 255, ${rayIntensity * 0.6})`;
    for (let i = 0; i < rayCount; i += 2) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayLen = rx * (0.5 + pseudoNoise(i, lon) * 0.6);
      minCtx.lineWidth = 1.5;
      minCtx.beginPath();
      minCtx.moveTo(cx, cy);
      minCtx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      minCtx.stroke();
    }
    minCtx.restore();
  };

  // Tycho: spectacular 1,500 km rays!
  drawRaySystem(-43.31, -11.36, 1400, 36, 0.7);
  // Copernicus: 800 km rays
  drawRaySystem(9.62, -20.08, 700, 24, 0.6);
  // Kepler
  drawRaySystem(8.1, -38.0, 350, 16, 0.5);
  // Jackson on the far side
  drawRaySystem(22.4, -163.1, 800, 24, 0.65);

  // Step 4: Draw Individual Craters with rim shadow and central peaks
  const drawCrater = (lat: number, lon: number, diameterKm: number, depthKm: number = 3) => {
    const [cx, cy] = latLonToPixel(lat, lon, width, height);
    const { rx, ry } = kmToPixelRadius(diameterKm / 2, lat, width, height);
    const r = Math.max(2, Math.max(rx, ry));

    // 1. Diffuse Canvas: Bright illuminated rim on western side, dark shadow on eastern side
    diffuseCtx.save();
    // Inner floor
    diffuseCtx.fillStyle = 'rgba(75, 75, 78, 0.75)';
    diffuseCtx.beginPath();
    diffuseCtx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
    diffuseCtx.fill();

    // Raised bright rim
    diffuseCtx.strokeStyle = 'rgba(235, 235, 240, 0.85)';
    diffuseCtx.lineWidth = Math.max(1, r * 0.25);
    diffuseCtx.beginPath();
    diffuseCtx.arc(cx, cy, r, 0, Math.PI * 2);
    diffuseCtx.stroke();

    // Central peak for large craters (>35km)
    if (diameterKm > 35 && r > 4) {
      diffuseCtx.fillStyle = 'rgba(250, 250, 255, 0.9)';
      diffuseCtx.beginPath();
      diffuseCtx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
      diffuseCtx.fill();
    }
    diffuseCtx.restore();

    // 2. Bump Map: High raised rim (white), depressed floor (black), central peak (white)
    bumpCtx.save();
    // Depressed floor
    bumpCtx.fillStyle = 'rgba(30, 30, 30, 0.95)';
    bumpCtx.beginPath();
    bumpCtx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
    bumpCtx.fill();

    // Raised rim
    bumpCtx.strokeStyle = 'rgba(245, 245, 245, 0.95)';
    bumpCtx.lineWidth = Math.max(1.5, r * 0.35);
    bumpCtx.beginPath();
    bumpCtx.arc(cx, cy, r, 0, Math.PI * 2);
    bumpCtx.stroke();

    // Central peak
    if (diameterKm > 35 && r > 4) {
      bumpCtx.fillStyle = 'rgba(255, 255, 255, 1)';
      bumpCtx.beginPath();
      bumpCtx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      bumpCtx.fill();
    }
    bumpCtx.restore();

    // 3. Topo Map: Depressed blue/cyan floor, orange/red rim
    topoCtx.save();
    topoCtx.fillStyle = 'rgba(30, 80, 180, 0.9)';
    topoCtx.beginPath();
    topoCtx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
    topoCtx.fill();

    topoCtx.strokeStyle = 'rgba(220, 120, 40, 0.85)';
    topoCtx.lineWidth = Math.max(1, r * 0.25);
    topoCtx.beginPath();
    topoCtx.arc(cx, cy, r, 0, Math.PI * 2);
    topoCtx.stroke();
    topoCtx.restore();
  };

  // Plot all scientific features from catalog
  for (const feature of LUNAR_FEATURES) {
    if (feature.type === 'crater' && feature.diameterKm) {
      drawCrater(feature.lat, feature.lon, feature.diameterKm, feature.depthKm || 3);
    }
  }

  // Draw hundreds of procedural small craters across the sphere to give authentic density
  for (let i = 0; i < 400; i++) {
    const lat = (pseudoNoise(i, 1) - 0.5) * 160;
    const lon = (pseudoNoise(i, 2) - 0.5) * 360;
    const diam = 15 + pseudoNoise(i, 3) * 60;
    drawCrater(lat, lon, diam, 2);
  }

  // Convert to Three.js textures
  const diffuseTexture = new THREE.CanvasTexture(diffuseCanvas);
  diffuseTexture.wrapS = THREE.RepeatWrapping;
  diffuseTexture.wrapT = THREE.ClampToEdgeWrapping;
  diffuseTexture.colorSpace = THREE.SRGBColorSpace;
  diffuseTexture.needsUpdate = true;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;
  bumpTexture.needsUpdate = true;

  const topoTexture = new THREE.CanvasTexture(topoCanvas);
  topoTexture.wrapS = THREE.RepeatWrapping;
  topoTexture.wrapT = THREE.ClampToEdgeWrapping;
  topoTexture.colorSpace = THREE.SRGBColorSpace;
  topoTexture.needsUpdate = true;

  const mineralTexture = new THREE.CanvasTexture(minCanvas);
  mineralTexture.wrapS = THREE.RepeatWrapping;
  mineralTexture.wrapT = THREE.ClampToEdgeWrapping;
  mineralTexture.colorSpace = THREE.SRGBColorSpace;
  mineralTexture.needsUpdate = true;

  return {
    diffuseMap: diffuseTexture,
    bumpMap: bumpTexture,
    topographicMap: topoTexture,
    mineralMap: mineralTexture,
  };
}

/**
 * Procedural Starfield & Milky Way Generator for deep space background
 */
export function createStarfield(count = 2500, radius = 600): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribute on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.85 + Math.random() * 0.3);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Spectral colors: mostly crisp white, some blue, some warm yellow/orange
    const starType = Math.random();
    if (starType > 0.88) {
      // Warm yellow/orange giant
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.82;
      colors[i * 3 + 2] = 0.65;
      sizes[i] = 2.2 + Math.random() * 2.0;
    } else if (starType > 0.7) {
      // Hot blue-white star
      colors[i * 3] = 0.75;
      colors[i * 3 + 1] = 0.88;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = 1.8 + Math.random() * 1.6;
    } else {
      // Main sequence white star
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;
      sizes[i] = 1.0 + Math.random() * 1.4;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Circular star sprite texture
  const starCanvas = document.createElement('canvas');
  starCanvas.width = 32;
  starCanvas.height = 32;
  const ctx = starCanvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const starTexture = new THREE.CanvasTexture(starCanvas);

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    map: starTexture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}
