export interface SpriteClip {
  pixelSize: number;
  frameDuration: number;
  speedInfluence: number;
  frames: string[][];
  width: number;
  height: number;
}

export function createSpriteClip(
  pixelSize: number,
  frameDuration: number,
  speedInfluence: number,
  frames: string[][]
): SpriteClip {
  let width = 1;
  let height = 1;
  for (const frame of frames) {
    height = Math.max(height, frame.length);
    for (const row of frame) {
      width = Math.max(width, row.length);
    }
  }

  const padded: string[][] = [];
  for (let f = 0; f < frames.length; f++) {
    padded[f] = [];
    for (let y = 0; y < height; y++) {
      const row = y < frames[f].length ? frames[f][y] : '';
      padded[f][y] = row.padEnd(width, '.');
    }
  }

  return {
    pixelSize,
    frameDuration,
    speedInfluence,
    frames: padded,
    width,
    height
  };
}

export function frameAt(clip: SpriteClip, time: number, phase: number, speed: number): number {
  const count = clip.frames.length;
  const tempo = Math.max(0.75, Math.min(1.15, 0.9 + Math.min(speed, 0.8) * clip.speedInfluence));
  const duration = clip.frameDuration / tempo;
  let frame = Math.floor((time + phase) / duration) % count;
  return frame < 0 ? frame + count : frame;
}

export interface FishPalette {
  outline: string;
  body: string;
  bodyDark: string;
  bodyMedium: string;
  belly: string;
  bellyLight: string;
  fin: string;
  finDark: string;
  finMedium: string;
  finLight: string;
  eyeWhite: string;
  pupil: string;
  shine: string;
  mouth: string;
  shadow: string;
  gill: string;
}

export function createFishPalette(body: string, fin: string): FishPalette {
  const bodyRgba = parseRgba(body);
  const finRgba = parseRgba(fin);

  return {
    outline: `rgba(${Math.floor(bodyRgba.r * 0.28)}, ${Math.floor(bodyRgba.g * 0.18)}, ${Math.floor(bodyRgba.b * 0.1)}, 1)`,
    body,
    bodyDark: mixColors(body, 'rgba(0, 0, 0, 1)', 0.35),
    bodyMedium: mixColors(body, 'rgba(0, 0, 0, 1)', 0.18),
    belly: mixColors(body, 'rgba(255, 255, 255, 1)', 0.45),
    bellyLight: mixColors(body, 'rgba(255, 255, 255, 1)', 0.65),
    fin,
    finDark: mixColors(fin, 'rgba(0, 0, 0, 1)', 0.38),
    finMedium: mixColors(fin, 'rgba(0, 0, 0, 1)', 0.2),
    finLight: mixColors(fin, 'rgba(255, 255, 255, 1)', 0.35),
    eyeWhite: 'rgba(255, 253, 240, 1)',
    pupil: 'rgba(12, 10, 14, 1)',
    shine: 'rgba(255, 255, 255, 1)',
    mouth: mixColors(body, 'rgba(110, 35, 50, 1)', 0.55),
    shadow: 'rgba(6, 14, 28, 0.18)',
    gill: mixColors(body, 'rgba(80, 40, 60, 1)', 0.3),
  };
}

function parseRgba(color: string): { r: number; g: number; b: number; a: number } {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

function mixColors(color1: string, color2: string, t: number): string {
  const rgba1 = parseRgba(color1);
  const rgba2 = parseRgba(color2);
  const clampedT = Math.max(0, Math.min(1, t));
  return `rgba(${rgba1.r + (rgba2.r - rgba1.r) * clampedT}, ${rgba1.g + (rgba2.g - rgba1.g) * clampedT}, ${rgba1.b + (rgba2.b - rgba1.b) * clampedT}, ${rgba1.a})`;
}
