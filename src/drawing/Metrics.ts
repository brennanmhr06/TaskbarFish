export class Metrics {
  static readonly defaultTankWidth = 320;
  static readonly defaultTankHeight = 120;
  static readonly minTankWidth = 300;
  static readonly minTankHeight = 80;
  static readonly maxTankWidth = 1200;
  static readonly maxTankHeight = 420;
  static readonly metersPerPixelWidth = 2.6 / 320;
  static readonly metersPerPixelHeight = 0.92 / 120;

  static tankWidth = Metrics.defaultTankWidth;
  static tankHeight = Metrics.defaultTankHeight;
  static readonly lidDepth = 18;
  static readonly lidInset = 22;
  static readonly glassThickness = 5;
  static readonly bottomThickness = 8;
  static readonly buttonSize = 22;
  static readonly buttonMargin = 5;
  static readonly menuHeight = 470;
  static readonly resizeHandle = 10;

  static get tankFrameHeight(): number {
    return this.lidDepth + this.tankHeight;
  }
  
  static get totalHeight(): number {
    return this.tankFrameHeight + this.menuHeight;
  }

  static setTankSize(width: number, height: number): void {
    this.tankWidth = Math.round(
      Math.min(this.maxTankWidth, Math.max(this.minTankWidth, width))
    );
    this.tankHeight = Math.round(
      Math.min(this.maxTankHeight, Math.max(this.minTankHeight, height))
    );
  }

  static closeButtonRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.tankWidth - 40, y: 17, width: 22, height: 22 };
  }

  static menuBounds(): { x: number; y: number; width: number; height: number } {
    return { x: 0, y: 0, width: this.tankWidth, height: this.menuHeight };
  }

  static cardWidth(): number {
    return this.tankWidth - 20;
  }

  static buttonBounds(menuOffset: number): { x: number; y: number; width: number; height: number } {
    return {
      x: this.tankWidth - this.glassThickness - this.buttonMargin - this.buttonSize,
      y: menuOffset + this.lidDepth + this.buttonMargin,
      width: this.buttonSize,
      height: this.buttonSize,
    };
  }

  static tankBounds(menuOffset: number): { x: number; y: number; width: number; height: number } {
    return {
      x: 0,
      y: menuOffset,
      width: this.tankWidth,
      height: this.tankFrameHeight,
    };
  }
}
