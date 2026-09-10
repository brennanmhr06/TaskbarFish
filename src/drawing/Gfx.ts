import { Palette } from './Palette';

export class Gfx {
  static fillRound(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    _radius: number,
    top: string,
    bottom: string
  ): void {
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }
    this.pixelBevel(ctx, bounds, top, bottom, false);
  }

  static glassCard(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    _radius: number
  ): void {
    ctx.fillStyle = Palette.pixelShadow;
    ctx.fillRect(bounds.x + 3, bounds.y + 3, bounds.width, bounds.height);

    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, 'rgba(42, 106, 160, 0.94)');
    gradient.addColorStop(1, 'rgba(18, 54, 92, 0.94)');
    ctx.fillStyle = gradient;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    ctx.strokeStyle = Palette.pixelNavy;
    ctx.lineWidth = 3;
    ctx.strokeRect(bounds.x + 1.5, bounds.y + 1.5, bounds.width - 3, bounds.height - 3);

    ctx.fillStyle = 'rgba(200, 236, 255, 0.28)';
    ctx.fillRect(bounds.x + 3, bounds.y + 3, bounds.width - 6, 2);
    ctx.fillRect(bounds.x + 3, bounds.y + 3, 2, bounds.height - 6);

    ctx.fillStyle = 'rgba(7, 24, 40, 0.35)';
    ctx.fillRect(bounds.x + bounds.width - 5, bounds.y + 4, 2, bounds.height - 7);
    ctx.fillRect(bounds.x + 4, bounds.y + bounds.height - 5, bounds.width - 8, 2);

    this.scanlines(ctx, bounds, 0.08);
  }

  static insetWell(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    _radius: number
  ): void {
    ctx.fillStyle = '#082038';
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeStyle = Palette.pixelNavy;
    ctx.lineWidth = 3;
    ctx.strokeRect(bounds.x + 1.5, bounds.y + 1.5, bounds.width - 3, bounds.height - 3);
    ctx.fillStyle = 'rgba(4, 16, 24, 0.55)';
    ctx.fillRect(bounds.x + 3, bounds.y + 3, bounds.width - 6, 2);
    ctx.fillRect(bounds.x + 3, bounds.y + 3, 2, bounds.height - 6);
    ctx.fillStyle = 'rgba(74, 160, 208, 0.35)';
    ctx.fillRect(bounds.x + 3, bounds.y + bounds.height - 5, bounds.width - 6, 2);
  }

  static glossyButton(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    top: string,
    bottom: string
  ): void {
    this.pixelBevel(ctx, bounds, top, bottom, false);
  }

  static pixelBevel(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    top: string,
    bottom: string,
    selected = false
  ): void {
    ctx.fillStyle = Palette.pixelShadow;
    ctx.fillRect(bounds.x + 3, bounds.y + 3, bounds.width, bounds.height);

    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, this.lightenColor(top, 18));
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    ctx.strokeStyle = Palette.pixelNavy;
    ctx.lineWidth = 3;
    ctx.strokeRect(bounds.x + 1.5, bounds.y + 1.5, bounds.width - 3, bounds.height - 3);

    ctx.fillStyle = selected ? 'rgba(244, 251, 255, 0.55)' : 'rgba(200, 236, 255, 0.4)';
    ctx.fillRect(bounds.x + 3, bounds.y + 3, bounds.width - 6, 2);
    ctx.fillRect(bounds.x + 3, bounds.y + 3, 2, bounds.height - 6);
  }

  static scanlines(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    alpha = 0.1
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.clip();
    ctx.fillStyle = `rgba(8, 24, 40, ${alpha})`;
    for (let y = Math.floor(bounds.y); y < bounds.y + bounds.height; y += 4) {
      ctx.fillRect(bounds.x, y, bounds.width, 2);
    }
    ctx.restore();
  }

  static dither(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    color = 'rgba(8, 24, 40, 0.12)'
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.clip();
    ctx.fillStyle = color;
    for (let y = Math.floor(bounds.y); y < bounds.y + bounds.height; y += 2) {
      for (let x = Math.floor(bounds.x) + (y % 4 === 0 ? 0 : 2); x < bounds.x + bounds.width; x += 4) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.restore();
  }

  static sectionLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    ctx.font = `bold 9px ${Palette.pixelFont}`;
    ctx.fillStyle = Palette.inkMuted;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(text, x, y);
  }

  static centeredText(
    ctx: CanvasRenderingContext2D,
    text: string,
    font: string,
    brush: string,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    const previousAlign = ctx.textAlign;
    const previousBaseline = ctx.textBaseline;
    ctx.font = font;
    ctx.fillStyle = brush;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    ctx.textAlign = previousAlign;
    ctx.textBaseline = previousBaseline;
  }

  static roundedRect(
    bounds: { x: number; y: number; width: number; height: number },
    radius: number
  ): Path2D {
    const diameter = Math.max(2, radius * 2);
    const clampedDiameter = Math.min(diameter, Math.min(bounds.width, bounds.height));
    const path = new Path2D();
    path.moveTo(bounds.x + clampedDiameter / 2, bounds.y);
    path.arcTo(bounds.x + bounds.width, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height, clampedDiameter / 2);
    path.arcTo(
      bounds.x + bounds.width,
      bounds.y + bounds.height,
      bounds.x,
      bounds.y + bounds.height,
      clampedDiameter / 2
    );
    path.arcTo(bounds.x, bounds.y + bounds.height, bounds.x, bounds.y, clampedDiameter / 2);
    path.arcTo(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y, clampedDiameter / 2);
    path.closePath();
    return path;
  }

  static roundedTopRect(
    bounds: { x: number; y: number; width: number; height: number },
    radius: number
  ): Path2D {
    const diameter = Math.max(2, radius * 2);
    const clampedDiameter = Math.min(diameter, Math.min(bounds.width, bounds.height));
    const path = new Path2D();
    path.moveTo(bounds.x + clampedDiameter / 2, bounds.y);
    path.arcTo(bounds.x + bounds.width, bounds.y, bounds.x + bounds.width, bounds.y + bounds.height, clampedDiameter / 2);
    path.lineTo(bounds.x + bounds.width, bounds.y + bounds.height);
    path.lineTo(bounds.x, bounds.y + bounds.height);
    path.lineTo(bounds.x, bounds.y + clampedDiameter / 2);
    path.arcTo(bounds.x, bounds.y, bounds.x + bounds.width, bounds.y, clampedDiameter / 2);
    path.closePath();
    return path;
  }

  private static lightenColor(color: string, amount: number): string {
    const rgba = this.parseRgba(color);
    return `rgba(${Math.min(255, rgba.r + amount)}, ${Math.min(255, rgba.g + amount)}, ${Math.min(255, rgba.b + amount)}, ${rgba.a})`;
  }

  private static parseRgba(color: string): { r: number; g: number; b: number; a: number } {
    const hex = color.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const n = parseInt(hex[1], 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
    }
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
}
