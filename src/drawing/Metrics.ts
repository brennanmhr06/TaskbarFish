export class Metrics {
  static readonly tankWidth = 320;
  static readonly tankHeight = 120;
  static readonly lidDepth = 18;
  static readonly lidInset = 22;
  static readonly glassThickness = 5;
  static readonly bottomThickness = 8;
  static readonly buttonSize = 22;
  static readonly buttonMargin = 5;
  static readonly menuHeight = 460;

  static get tankFrameHeight(): number {
    return this.lidDepth + this.tankHeight;
  }

  static closeButtonRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.tankWidth - 40, y: 17, width: 22, height: 22 };
  }

  static levelButtonRect(): { x: number; y: number; width: number; height: number } {
    return { x: this.tankWidth - 78, y: 74, width: 56, height: 26 };
  }

  static menuBounds(): { x: number; y: number; width: number; height: number } {
    return { x: 0, y: 0, width: this.tankWidth, height: this.menuHeight };
  }

  static buttonBounds(menuOffset: number): { x: number; y: number; width: number; height: number } {
    return {
      x: this.tankWidth - this.glassThickness - this.buttonMargin - this.buttonSize,
      y: menuOffset + this.lidDepth + this.buttonMargin,
      width: this.buttonSize,
      height: this.buttonSize,
    };
  }
}
