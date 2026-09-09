import { FishSwim, FishIdle, frameAt, FishPalette, createFishPalette } from './AnimationConfig';

export function drawFish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  right: boolean,
  body: string,
  fin: string,
  time = 0,
  phase = 0,
  speed = 0.45,
  scale = 1
): void {
  const clip = speed > 0.08 ? FishSwim : FishIdle;
  const map = clip.frames[frameAt(clip, time, phase, Math.min(speed, 0.6))];
  const pixel = clip.pixelSize;
  const width = clip.width * pixel;
  const height = clip.height * pixel;
  const palette = createFishPalette(body, fin);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(right ? scale : -scale, scale);
  ctx.translate(-Math.floor(width / 2), -Math.floor(height / 2));
  drawPixelMap(ctx, map, pixel, palette, false);
  ctx.restore();
}

function drawPixelMap(
  ctx: CanvasRenderingContext2D,
  map: string[],
  pixel: number,
  palette: FishPalette,
  shadow: boolean
): void {
  const ox = shadow ? 1 : 0;
  const oy = shadow ? 1 : 0;

  for (let row = 0; row < map.length; row++) {
    const cells = map[row];
    for (let col = 0; col < cells.length; col++) {
      const char = cells[col];
      let brush: string | null = null;

      switch (char) {
        case '.':
        case ' ':
          brush = null;
          break;
        case '#':
          brush = palette.outline;
          break;
        case 'd':
          brush = palette.bodyDark;
          break;
        case 'b':
          brush = palette.body;
          break;
        case 'l':
          brush = palette.belly;
          break;
        case 'f':
          brush = palette.fin;
          break;
        case 'n':
          brush = palette.finDark;
          break;
        case 'h':
          brush = palette.finLight;
          break;
        case 'W':
          brush = palette.eyeWhite;
          break;
        case 'E':
          brush = palette.pupil;
          break;
        case 'H':
          brush = palette.shine;
          break;
        case 'm':
          brush = palette.mouth;
          break;
        case 'g':
          brush = palette.gill;
          break;
        case 'L':
          brush = palette.bellyLight;
          break;
        case 'M':
          brush = palette.bodyMedium;
          break;
        case 'F':
          brush = palette.finMedium;
          break;
        case 'D':
          brush = palette.finLight;
          break;
        case 'T':
          brush = palette.fin;
          break;
        default:
          brush = null;
      }

      if (brush === null) {
        continue;
      }

      ctx.fillStyle = brush;
      ctx.fillRect(col * pixel + ox, row * pixel + oy, pixel, pixel);
    }
  }
}

export function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, 'rgba(100, 160, 200, 0.39)');
  gradient.addColorStop(1, 'rgba(20, 60, 100, 0.16)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x + size / 2, y + size / 2, size / 2, size / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(80, 140, 180, 0.59)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const highlightSize = Math.max(2, size / 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(x + size / 4, y + size / 6, highlightSize, Math.max(2, size / 4));

  if (size > 4) {
    ctx.fillRect(x + size / 2, y + size / 3, 1, 1);
  }
}

export function drawDecoration(ctx: CanvasRenderingContext2D, slot: { x: number; y: number; width: number; height: number }, kind: number): void {
  const cx = slot.x + slot.width / 2;
  const cy = slot.y + slot.height / 2 + 1;

  switch (kind) {
    case 0:
      ctx.strokeStyle = 'rgba(36, 110, 72, 1)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy - 4);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 168, 102, 1)';
      ctx.fillRect(cx - 8, cy - 6, 8, 11);
      ctx.fillRect(cx, cy - 8, 8, 12);
      ctx.fillRect(cx - 4, cy - 12, 7, 9);
      break;
    case 1:
      ctx.fillStyle = 'rgba(232, 96, 118, 1)';
      ctx.fillRect(cx - 3, cy - 10, 6, 14);
      ctx.fillRect(cx - 9, cy - 4, 7, 10);
      ctx.fillRect(cx + 2, cy - 3, 7, 10);
      break;
    case 2:
      const chestGradient = ctx.createLinearGradient(cx - 9, cy - 6, cx - 9, cy + 8);
      chestGradient.addColorStop(0, 'rgba(196, 132, 56, 1)');
      chestGradient.addColorStop(1, 'rgba(140, 84, 32, 1)');
      ctx.fillStyle = chestGradient;
      ctx.fillRect(cx - 8, cy - 2, 16, 10);
      ctx.fillStyle = 'rgba(222, 168, 72, 1)';
      ctx.fillRect(cx - 9, cy - 7, 18, 6);
      ctx.fillStyle = 'rgba(255, 214, 96, 1)';
      ctx.fillRect(cx - 2, cy - 2, 4, 5);
      break;
    case 3:
      ctx.fillStyle = 'rgba(168, 150, 118, 1)';
      ctx.fillRect(cx - 9, cy - 2, 18, 12);
      ctx.fillRect(cx - 5, cy - 7, 11, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(cx - 3, cy - 5, 5, 3);
      break;
    case 4:
      ctx.fillStyle = 'rgba(236, 214, 170, 1)';
      ctx.fillRect(cx - 10, cy - 4, 20, 16);
      const pearlGradient = ctx.createLinearGradient(cx - 4, cy - 5, cx + 4, cy + 3);
      pearlGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      pearlGradient.addColorStop(1, 'rgba(180, 220, 240, 1)');
      ctx.fillStyle = pearlGradient;
      ctx.fillRect(cx - 4, cy - 4, 8, 8);
      break;
    default:
      ctx.fillStyle = 'rgba(176, 148, 118, 1)';
      ctx.fillRect(cx - 7, cy - 1, 14, 10);
      ctx.fillStyle = 'rgba(214, 92, 92, 1)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 10, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(cx - 2, cy + 3, 4, 6);
      break;
  }
}

export function drawNavGlyph(ctx: CanvasRenderingContext2D, bounds: { x: number; y: number; width: number; height: number }, kind: number): void {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  const scale = bounds.width / 30;

  switch (kind) {
    case 0:
      ctx.fillStyle = 'rgba(60, 100, 150, 1)';
      ctx.fillRect(cx - 10 * scale, cy - 2 * scale, 20 * scale, 10 * scale);
      ctx.fillStyle = 'rgba(80, 120, 180, 1)';
      ctx.fillRect(cx - 10 * scale, cy - 8 * scale, 20 * scale, 6 * scale);
      ctx.fillStyle = 'rgba(255, 200, 100, 1)';
      ctx.fillRect(cx - 8 * scale, cy - 6 * scale, 16 * scale, 6 * scale);
      break;
    case 1:
      ctx.fillStyle = 'rgba(255, 140, 60, 1)';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4 * scale, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(cx - 3 * scale, cy - 5 * scale, 6 * scale, 10 * scale);
      ctx.fillStyle = 'rgba(255, 180, 80, 1)';
      ctx.beginPath();
      ctx.moveTo(cx - 9 * scale, cy);
      ctx.lineTo(cx - 13 * scale, cy - 4 * scale);
      ctx.lineTo(cx - 5 * scale, cy - 3 * scale);
      ctx.closePath();
      ctx.fill();
      break;
    case 2:
      ctx.fillStyle = 'rgba(220, 60, 80, 1)';
      ctx.fillRect(cx - 8 * scale, cy - 5 * scale, 5 * scale, 5 * scale);
      ctx.fillRect(cx + 3 * scale, cy - 5 * scale, 5 * scale, 5 * scale);
      ctx.fillRect(cx - 3 * scale, cy - 2 * scale, 10 * scale, 5 * scale);
      ctx.fillRect(cx - 5 * scale, cy + 1 * scale, 10 * scale, 5 * scale);
      ctx.fillRect(cx - 3 * scale, cy + 4 * scale, 6 * scale, 3 * scale);
      break;
    case 3:
      ctx.fillStyle = 'rgba(255, 140, 60, 1)';
      ctx.fillRect(cx - 10 * scale, cy - 1 * scale, 5 * scale, 3 * scale);
      ctx.fillRect(cx - 3 * scale, cy - 3 * scale, 5 * scale, 4 * scale);
      ctx.fillRect(cx + 5 * scale, cy, 5 * scale, 3 * scale);
      ctx.fillRect(cx - 5 * scale, cy + 3 * scale, 5 * scale, 3 * scale);
      break;
    case 4:
      ctx.fillStyle = 'rgba(80, 180, 100, 1)';
      ctx.fillRect(cx - 2 * scale, cy - 1 * scale, 5 * scale, 3 * scale);
      ctx.fillRect(cx + 3 * scale, cy - 4 * scale, 3 * scale, 8 * scale);
      ctx.fillRect(cx + 6 * scale, cy - 1 * scale, 5 * scale, 3 * scale);
      ctx.fillStyle = 'rgba(60, 120, 180, 1)';
      ctx.fillRect(cx, cy - 1 * scale, 5 * scale, 3 * scale);
      ctx.fillRect(cx - 3 * scale, cy - 4 * scale, 3 * scale, 8 * scale);
      ctx.fillRect(cx - 6 * scale, cy - 1 * scale, 5 * scale, 3 * scale);
      break;
    case 5:
      ctx.fillStyle = 'rgba(220, 120, 160, 1)';
      ctx.fillRect(cx - 8 * scale, cy - 5 * scale, 16 * scale, 12 * scale);
      ctx.fillStyle = 'rgba(200, 60, 80, 1)';
      ctx.fillRect(cx - 1 * scale, cy - 5 * scale, 2 * scale, 12 * scale);
      ctx.fillRect(cx - 8 * scale, cy - 1 * scale, 16 * scale, 2 * scale);
      ctx.fillRect(cx - 5 * scale, cy - 8 * scale, 10 * scale, 3 * scale);
      ctx.fillRect(cx - 8 * scale, cy - 7 * scale, 3 * scale, 3 * scale);
      ctx.fillRect(cx + 5 * scale, cy - 7 * scale, 3 * scale, 3 * scale);
      break;
  }
}

export function drawLock(ctx: CanvasRenderingContext2D, bounds: { x: number; y: number; width: number; height: number }): void {
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;

  ctx.fillStyle = 'rgba(60, 90, 130, 0.78)';
  ctx.fillRect(cx - 7, cy - 3, 14, 12);

  ctx.fillStyle = 'rgba(80, 120, 160, 0.78)';
  ctx.fillRect(cx - 4, cy - 9, 8, 7);
  ctx.fillRect(cx - 5, cy - 8, 10, 1);

  ctx.fillStyle = 'rgba(120, 160, 200, 0.59)';
  ctx.fillRect(cx - 2, cy, 4, 4);
  ctx.fillRect(cx - 1, cy + 2, 2, 3);
}
