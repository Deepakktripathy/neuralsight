import React, { useState } from 'react';
import { DataSource, FailureMode } from '../../types';

interface GANSampleRendererProps {
  dataSource?: DataSource;
  step: number;
  failureMode?: FailureMode;
  latentVector: number[];
  seedOffset?: number;
  isReal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showPixelInspector?: boolean;
  label?: string;
  className?: string;
}

// Pseudo-random helper seeded by integers
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// 12x12 templates for MNIST digits: 8, 3, 0, 7
const MNIST_TEMPLATES: Record<string, number[][]> = {
  '8': [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  '3': [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  '0': [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  '7': [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
};

// Colors for CelebA Face: Hair, Skin, Eyes, Lips, Background
interface PixelColor {
  r: number;
  g: number;
  b: number;
}

// 12x12 Face template generator
function getFacePixels(seed: number, isReal: boolean, step: number, failureMode?: FailureMode, zInfluence = 0): PixelColor[][] {
  const grid: PixelColor[][] = [];
  const palette = [
    { hair: { r: 35, g: 25, b: 20 }, skin: { r: 253, g: 218, b: 181 }, eye: { r: 30, g: 58, b: 138 }, lip: { r: 225, g: 29, b: 72 }, bg: { r: 15, g: 23, b: 42 } },
    { hair: { r: 234, g: 179, b: 8 }, skin: { r: 254, g: 229, b: 205 }, eye: { r: 22, g: 101, b: 52 }, lip: { r: 244, g: 63, b: 94 }, bg: { r: 30, g: 41, b: 59 } },
    { hair: { r: 120, g: 53, b: 15 }, skin: { r: 217, g: 119, b: 6 }, eye: { r: 15, g: 23, b: 42 }, lip: { r: 190, g: 24, b: 93 }, bg: { r: 17, g: 24, b: 39 } },
    { hair: { r: 88, g: 28, b: 135 }, skin: { r: 252, g: 211, b: 177 }, eye: { r: 14, g: 116, b: 144 }, lip: { r: 225, g: 29, b: 72 }, bg: { r: 31, g: 41, b: 55 } },
  ];

  const pIdx = Math.floor(Math.abs(seed + zInfluence)) % palette.length;
  const col = palette[pIdx];

  // If Discriminator Overpowering: Generator never learned, pure noise
  if (!isReal && failureMode === 'Discriminator Overpowering') {
    for (let y = 0; y < 12; y++) {
      const row: PixelColor[] = [];
      for (let x = 0; x < 12; x++) {
        const n = pseudoRandom(y * 12 + x + seed * 99);
        row.push({ r: Math.floor(n * 255), g: Math.floor(pseudoRandom(seed + x) * 255), b: Math.floor(pseudoRandom(seed + y) * 255) });
      }
      grid.push(row);
    }
    return grid;
  }

  // Quality progress from 0 (static noise) to 1.0 (sharp)
  const quality = isReal ? 1.0 : Math.min(1.0, (step + 1) / 25);

  for (let y = 0; y < 12; y++) {
    const row: PixelColor[] = [];
    for (let x = 0; x < 12; x++) {
      let target: PixelColor = col.bg;

      // Hair region (top 3 rows and sides)
      if ((y < 3 && x >= 2 && x <= 9) || (y >= 3 && y <= 7 && (x === 1 || x === 2 || x === 9 || x === 10))) {
        target = col.hair;
      }
      // Face Oval (rows 3 to 10, cols 3 to 8)
      else if (y >= 3 && y <= 9 && x >= 3 && x <= 8) {
        target = col.skin;
        // Eyes at row 5, col 4 & 7
        if (y === 5 && (x === 4 || x === 7)) {
          target = col.eye;
        }
        // Nose at row 7, col 5 or 6
        else if (y === 7 && (x === 5 || x === 6)) {
          target = { r: Math.max(0, col.skin.r - 35), g: Math.max(0, col.skin.g - 35), b: Math.max(0, col.skin.b - 35) };
        }
        // Mouth at row 8, col 5 & 6
        else if (y === 8 && (x === 5 || x === 6)) {
          target = col.lip;
        }
      }
      // Neck / Shoulders
      else if (y >= 10 && x >= 4 && x <= 7) {
        target = { r: Math.max(0, col.skin.r - 20), g: Math.max(0, col.skin.g - 20), b: Math.max(0, col.skin.b - 20) };
      }

      // Blend target with noise based on training quality
      const noiseR = pseudoRandom(y * 12 + x + seed * 17 + (isReal ? 0 : step * 7)) * 255;
      const noiseG = pseudoRandom(y * 12 + x + seed * 31 + (isReal ? 0 : step * 7)) * 255;
      const noiseB = pseudoRandom(y * 12 + x + seed * 47 + (isReal ? 0 : step * 7)) * 255;

      row.push({
        r: Math.round(target.r * quality + noiseR * (1 - quality)),
        g: Math.round(target.g * quality + noiseG * (1 - quality)),
        b: Math.round(target.b * quality + noiseB * (1 - quality)),
      });
    }
    grid.push(row);
  }
  return grid;
}

// 12x12 Landscape template generator
function getLandscapePixels(seed: number, isReal: boolean, step: number, failureMode?: FailureMode, zInfluence = 0): PixelColor[][] {
  const grid: PixelColor[][] = [];
  const quality = isReal ? 1.0 : Math.min(1.0, (step + 1) / 25);

  if (!isReal && failureMode === 'Discriminator Overpowering') {
    for (let y = 0; y < 12; y++) {
      const row: PixelColor[] = [];
      for (let x = 0; x < 12; x++) {
        const n = pseudoRandom(y * 12 + x + seed * 99);
        row.push({ r: Math.floor(n * 255), g: Math.floor(n * 200), b: Math.floor(pseudoRandom(seed + y) * 255) });
      }
      grid.push(row);
    }
    return grid;
  }

  for (let y = 0; y < 12; y++) {
    const row: PixelColor[] = [];
    for (let x = 0; x < 12; x++) {
      let target: PixelColor;

      // Sky gradient (top 0-5)
      if (y <= 4) {
        const skyT = y / 4;
        // Sun at row 2-3, col 7-8
        if ((y === 2 || y === 3) && (x === 7 || x === 8)) {
          target = { r: 254, g: 240, b: 138 }; // Radiant sun
        } else {
          // sunset glow: orange to deep purple
          target = {
            r: Math.round(147 * (1 - skyT) + 249 * skyT),
            g: Math.round(51 * (1 - skyT) + 115 * skyT),
            b: Math.round(234 * (1 - skyT) + 22 * skyT)
          };
        }
      }
      // Mountains silhouette (y 5 to 7)
      else if (y >= 5 && y <= 7) {
        const mHeight = 5 + Math.round(Math.abs(Math.sin((x + seed + zInfluence) * 0.8)) * 2);
        if (y >= mHeight) {
          target = { r: 30, g: 27, b: 75 }; // Dark mountain
        } else {
          target = { r: 249, g: 115, b: 22 }; // Horizon sunset glow
        }
      }
      // Lake / water reflection (y 8 to 11)
      else {
        const wave = pseudoRandom(y * 5 + x + seed) * 30;
        target = {
          r: Math.round(30 + wave),
          g: Math.round(58 + wave * 1.5),
          b: Math.round(138 + wave)
        };
      }

      // Blend with noise
      const noise = pseudoRandom(y * 12 + x + seed * 13 + (isReal ? 0 : step * 7)) * 255;
      row.push({
        r: Math.round(target.r * quality + noise * (1 - quality)),
        g: Math.round(target.g * quality + noise * (1 - quality)),
        b: Math.round(target.b * quality + noise * (1 - quality)),
      });
    }
    grid.push(row);
  }
  return grid;
}

export const GANSampleRenderer: React.FC<GANSampleRendererProps> = ({
  dataSource = 'Celebrity Faces (CelebA)',
  step,
  failureMode,
  latentVector,
  seedOffset = 0,
  isReal = false,
  size = 'md',
  showPixelInspector = true,
  label,
  className = ''
}) => {
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number; val: string } | null>(null);

  const isMNIST = dataSource.includes('MNIST');
  const isLandscape = dataSource.includes('Landscape');

  // Mode Collapse handling:
  // In mode collapse, all generated samples collapse to the EXACT same fixed seed & pattern,
  // ignoring latent vector differences!
  const effectiveSeed = (!isReal && failureMode === 'Mode Collapse') ? 42 : seedOffset;
  const zSum = (!isReal && failureMode === 'Mode Collapse') 
    ? 0 
    : (latentVector.slice(0, 4).reduce((a, b) => a + b, 0) || 0);

  // Generate 12x12 matrix
  let pixelGrid: { r: number; g: number; b: number; normVal: number }[][] = [];

  if (isMNIST) {
    const digitKeys = ['8', '3', '0', '7'];
    const selectedDigit = isReal 
      ? digitKeys[seedOffset % digitKeys.length] 
      : (failureMode === 'Mode Collapse' ? '8' : digitKeys[Math.floor(Math.abs(effectiveSeed + zSum)) % digitKeys.length]);

    const template = MNIST_TEMPLATES[selectedDigit] || MNIST_TEMPLATES['8'];
    const quality = isReal ? 1.0 : (failureMode === 'Discriminator Overpowering' ? 0.05 : Math.min(1.0, (step + 1) / 25));

    pixelGrid = template.map((row, y) =>
      row.map((val, x) => {
        const noise = pseudoRandom(y * 12 + x + effectiveSeed * 17 + (isReal ? 0 : step * 5));
        const finalIntensity = val * quality + noise * (1 - quality);
        const byteVal = Math.round(Math.min(1, Math.max(0, finalIntensity)) * 255);
        return {
          r: byteVal,
          g: byteVal,
          b: byteVal,
          normVal: Number((finalIntensity * 2 - 1).toFixed(2)) // Tanh range [-1, 1]
        };
      })
    );
  } else if (isLandscape) {
    const colorGrid = getLandscapePixels(effectiveSeed, isReal, step, failureMode, zSum);
    pixelGrid = colorGrid.map((row) =>
      row.map((c) => ({
        r: c.r,
        g: c.g,
        b: c.b,
        normVal: Number(((c.r + c.g + c.b) / (3 * 127.5) - 1).toFixed(2))
      }))
    );
  } else {
    // Celebrity Faces (CelebA) default
    const colorGrid = getFacePixels(effectiveSeed, isReal, step, failureMode, zSum);
    pixelGrid = colorGrid.map((row) =>
      row.map((c) => ({
        r: c.r,
        g: c.g,
        b: c.b,
        normVal: Number(((c.r + c.g + c.b) / (3 * 127.5) - 1).toFixed(2))
      }))
    );
  }

  // Dimension scaling
  const dimClass = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-36 h-36 sm:w-44 sm:h-44'
  }[size];

  const borderClass = isReal
    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/30'
    : failureMode === 'Mode Collapse'
    ? 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/40'
    : 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/30';

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          {label}
          {!isReal && failureMode === 'Mode Collapse' && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 animate-pulse">
              COLLAPSED
            </span>
          )}
        </span>
      )}

      <div className={`relative p-1.5 bg-slate-950 rounded-xl border ${borderClass} overflow-hidden group`}>
        {/* Pixel Canvas Grid */}
        <div
          className={`grid grid-cols-12 grid-rows-12 gap-[1px] ${dimClass} cursor-crosshair`}
          onMouseLeave={() => setHoveredPixel(null)}
        >
          {pixelGrid.map((row, y) =>
            row.map((pixel, x) => (
              <div
                key={`${y}-${x}`}
                style={{ backgroundColor: `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})` }}
                className="w-full h-full rounded-[0.5px] transition-colors hover:ring-1 hover:ring-white hover:z-20"
                onMouseEnter={() =>
                  setHoveredPixel({
                    x,
                    y,
                    val: isMNIST ? `Value: ${pixel.normVal}` : `RGB(${pixel.r},${pixel.g},${pixel.b})`
                  })
                }
              />
            ))
          )}
        </div>

        {/* Hover Inspector Tooltip */}
        {showPixelInspector && hoveredPixel && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300 pointer-events-none z-30 whitespace-nowrap shadow-lg">
            [{hoveredPixel.x}, {hoveredPixel.y}]: {hoveredPixel.val}
          </div>
        )}
      </div>
    </div>
  );
};
