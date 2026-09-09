import { Palette } from './Palette';

export class Gfx {
  static fillRound(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    radius: number,
    top: string,
    bottom: string
  ): void {
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const path = this.roundedRect(bounds, radius);
    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, this.lightenColor(top, 20));
    gradient.addColorStop(0.4, top);
    gradient.addColorStop(0.7, bottom);
    gradient.addColorStop(1, this.darkenColor(bottom, 20));

    ctx.fillStyle = gradient;
    ctx.fill(path);
  }

  static glassCard(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    radius: number
  ): void {
    const shadowGlow = this.roundedRect(
      { x: bounds.x + 2, y: bounds.y + 5, width: bounds.width, height: bounds.height },
      radius
    );
    ctx.fillStyle = 'rgba(20, 45, 70, 0.2)';
    ctx.fill(shadowGlow);

    const shadow = this.roundedRect(
      { x: bounds.x, y: bounds.y + 3, width: bounds.width, height: bounds.height },
      radius
    );
    ctx.fillStyle = 'rgba(15, 35, 55, 0.16)';
    ctx.fill(shadow);

    const path = this.roundedRect(bounds, radius);
    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, 'rgba(70, 120, 160, 0.78)');
    gradient.addColorStop(0.33, 'rgba(60, 110, 150, 0.71)');
    gradient.addColorStop(0.66, 'rgba(50, 100, 140, 0.63)');
    gradient.addColorStop(1, 'rgba(40, 90, 130, 0.55)');
    ctx.fillStyle = gradient;
    ctx.fill(path);

    ctx.strokeStyle = 'rgba(120, 180, 240, 0.86)';
    ctx.lineWidth = 1.8;
    ctx.stroke(path);

    ctx.strokeStyle = 'rgba(150, 200, 255, 0.24)';
    ctx.lineWidth = 1;
    ctx.stroke(path);

    const innerPath = this.roundedRect(
      { x: bounds.x + 2, y: bounds.y + 2, width: bounds.width - 4, height: bounds.height - 4 },
      Math.max(2, radius - 2)
    );
    ctx.strokeStyle = 'rgba(100, 160, 200, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke(innerPath);

    ctx.save();
    ctx.clip(path);
    const shine = {
      x: bounds.x + 5,
      y: bounds.y + 1,
      width: bounds.width - 10,
      height: Math.max(10, bounds.height / 2.5),
    };
    const shineGradient = ctx.createLinearGradient(shine.x, shine.y, shine.x, shine.y + shine.height);
    shineGradient.addColorStop(0, 'rgba(180, 230, 255, 0.22)');
    shineGradient.addColorStop(1, 'rgba(100, 160, 200, 0.02)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(shine.x, shine.y, shine.width, shine.height);

    ctx.fillStyle = 'rgba(200, 240, 255, 0.16)';
    ctx.fillRect(bounds.x + 4, bounds.y + 1, bounds.width - 8, 3);

    ctx.restore();
  }

  static insetWell(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    radius: number
  ): void {
    const path = this.roundedRect(bounds, radius);
    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, 'rgba(25, 55, 85, 0.39)');
    gradient.addColorStop(1, 'rgba(15, 40, 65, 0.51)');
    ctx.fillStyle = gradient;
    ctx.fill(path);

    ctx.strokeStyle = 'rgba(110, 170, 230, 0.51)';
    ctx.lineWidth = 1.5;
    const highlightPath = this.roundedRect(
      { x: bounds.x + 1, y: bounds.y + 1, width: bounds.width - 2, height: bounds.height - 2 },
      Math.max(2, radius - 1)
    );
    ctx.stroke(highlightPath);

    ctx.strokeStyle = 'rgba(90, 150, 190, 0.31)';
    ctx.lineWidth = 0.8;
    const innerPath = this.roundedRect(
      { x: bounds.x + 2, y: bounds.y + 2, width: bounds.width - 4, height: bounds.height - 4 },
      Math.max(2, radius - 2)
    );
    ctx.stroke(innerPath);

    ctx.strokeStyle = 'rgba(30, 60, 90, 0.16)';
    ctx.lineWidth = 0.5;
    const shadowPath = this.roundedRect(
      { x: bounds.x + 3, y: bounds.y + 3, width: bounds.width - 6, height: bounds.height - 6 },
      Math.max(2, radius - 3)
    );
    ctx.stroke(shadowPath);
  }

  static glossyButton(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    top: string,
    bottom: string
  ): void {
    const shadowGlow = this.roundedRect(
      { x: bounds.x + 2, y: bounds.y + 5, width: bounds.width, height: bounds.height },
      9
    );
    ctx.fillStyle = 'rgba(25, 50, 75, 0.24)';
    ctx.fill(shadowGlow);

    const shadow = this.roundedRect(
      { x: bounds.x, y: bounds.y + 3, width: bounds.width, height: bounds.height },
      9
    );
    ctx.fillStyle = 'rgba(18, 40, 60, 0.2)';
    ctx.fill(shadow);

    const path = this.roundedRect(bounds, 9);
    const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    gradient.addColorStop(0, this.lightenColor(top, 30));
    gradient.addColorStop(0.3, top);
    gradient.addColorStop(0.7, this.mixColors(top, bottom, 0.5));
    gradient.addColorStop(1, bottom);
    ctx.fillStyle = gradient;
    ctx.fill(path);

    const shineGradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
    shineGradient.addColorStop(0, 'rgba(180, 230, 255, 0.63)');
    shineGradient.addColorStop(1, 'rgba(100, 160, 200, 0.12)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(bounds.x + 4, bounds.y + 1, bounds.width - 8, bounds.height / 2);

    ctx.fillStyle = 'rgba(220, 250, 255, 0.39)';
    ctx.fillRect(bounds.x + 5, bounds.y + 1, bounds.width - 10, 3);

    ctx.strokeStyle = 'rgba(140, 200, 255, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.stroke(path);

    ctx.strokeStyle = 'rgba(150, 210, 255, 0.31)';
    ctx.lineWidth = 1;
    ctx.stroke(path);

    const innerEdge = this.roundedRect(
      { x: bounds.x + 2, y: bounds.y + 2, width: bounds.width - 4, height: bounds.height - 4 },
      7
    );
    ctx.strokeStyle = 'rgba(110, 170, 210, 0.39)';
    ctx.lineWidth = 0.9;
    ctx.stroke(innerEdge);
  }

  static sectionLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    ctx.font = 'bold 9px "Segoe UI", sans-serif';
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

  private static darkenColor(color: string, amount: number): string {
    const rgba = this.parseRgba(color);
    return `rgba(${Math.max(0, rgba.r - amount)}, ${Math.max(0, rgba.g - amount)}, ${Math.max(0, rgba.b - amount)}, ${rgba.a})`;
  }

  private static mixColors(color1: string, color2: string, t: number): string {
    const rgba1 = this.parseRgba(color1);
    const rgba2 = this.parseRgba(color2);
    const clampedT = Math.max(0, Math.min(1, t));
    return `rgba(${rgba1.r + (rgba2.r - rgba1.r) * clampedT}, ${rgba1.g + (rgba2.g - rgba1.g) * clampedT}, ${rgba1.b + (rgba2.b - rgba1.b) * clampedT}, ${rgba1.a})`;
  }

  private static parseRgba(color: string): { r: number; g: number; b: number; a: number } {
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
