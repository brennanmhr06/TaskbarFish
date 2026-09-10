import React, { useEffect, useRef } from 'react';

const SCALE = 4;
const COLS = 96;
const ROWS = 28;

function pixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, w = 1, h = 1): void {
  ctx.fillStyle = color;
  ctx.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE);
}

function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, facingRight: boolean, body: string, fin: string): void {
  const dir = facingRight ? 1 : -1;
  pixel(ctx, x, y, body, 4, 3);
  pixel(ctx, x + dir * 4, y + 1, body, 2, 1);
  pixel(ctx, x - dir * 2, y + 1, fin, 2, 2);
  pixel(ctx, x + (facingRight ? 3 : 0), y + 1, '#102038');
  pixel(ctx, x + (facingRight ? 3 : 0), y, '#f4fbff', 1, 1);
}

export function PixelTankBanner(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.imageSmoothingEnabled = false;

    let frame = 0;
    let raf = 0;

    const render = () => {
      frame += 1;
      const t = frame / 24;

      for (let y = 0; y < ROWS; y++) {
        const depth = y / ROWS;
        const r = Math.floor(28 + depth * 8);
        const g = Math.floor(88 - depth * 40);
        const b = Math.floor(140 - depth * 30);
        for (let x = 0; x < COLS; x++) {
          const dither = (x + y) % 2 === 0 ? 8 : 0;
          pixel(ctx, x, y, `rgb(${r},${g + dither},${b + dither})`);
        }
      }

      for (let i = 0; i < COLS; i++) {
        const wave = Math.round(Math.sin(t * 2 + i * 0.2) * 1);
        pixel(ctx, i, 2 + wave, '#9ad8ff');
        pixel(ctx, i, 3 + wave, '#5aa8d8');
      }

      for (let i = 0; i < COLS; i++) {
        pixel(ctx, i, ROWS - 4, '#d2b478');
        pixel(ctx, i, ROWS - 3, '#c09458');
        pixel(ctx, i, ROWS - 2, '#a87840');
        pixel(ctx, i, ROWS - 1, '#8a602c');
        if (i % 5 === 0) {
          pixel(ctx, i, ROWS - 4, '#e8cc90');
        }
      }

      const weeds = [8, 18, 72, 84];
      for (const wx of weeds) {
        for (let h = 0; h < 8; h++) {
          const sway = Math.round(Math.sin(t + wx + h * 0.4) * 1);
          pixel(ctx, wx + sway, ROWS - 5 - h, h % 2 === 0 ? '#2f8a58' : '#247848');
        }
      }

      const fishA = 12 + Math.round((Math.sin(t * 0.6) * 0.5 + 0.5) * 28);
      const fishB = 50 + Math.round((Math.cos(t * 0.45) * 0.5 + 0.5) * 22);
      drawFish(ctx, fishA, 10 + Math.round(Math.sin(t) * 2), true, '#ffb030', '#e86028');
      drawFish(ctx, fishB, 14 + Math.round(Math.cos(t * 1.2) * 2), false, '#ffd24a', '#e87820');

      for (let i = 0; i < 6; i++) {
        const bx = (18 + i * 13 + Math.round(Math.sin(t + i) * 2)) % COLS;
        const by = ROWS - 8 - ((Math.floor(t * 6) + i * 5) % 18);
        pixel(ctx, bx, by, '#c8ecff');
        pixel(ctx, bx, by - 1, '#7ec8f0');
      }

      ctx.fillStyle = '#143250';
      ctx.fillRect(0, 0, COLS * SCALE, SCALE * 2);
      ctx.fillRect(0, (ROWS - 1) * SCALE, COLS * SCALE, SCALE);
      ctx.fillRect(0, 0, SCALE * 2, ROWS * SCALE);
      ctx.fillRect((COLS - 2) * SCALE, 0, SCALE * 2, ROWS * SCALE);
      ctx.fillStyle = '#7ec8f0';
      ctx.fillRect(SCALE, SCALE, (COLS - 2) * SCALE, SCALE);
      ctx.fillRect(SCALE, SCALE, SCALE, (ROWS - 2) * SCALE);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * SCALE}
      height={ROWS * SCALE}
      className="pixel-banner"
    />
  );
}
