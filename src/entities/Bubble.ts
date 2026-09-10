export interface Algae {
  x: number;
  y: number;
  drift: number;
  speed: number;
  size: number;
  xpValue: number;
}

export function createAlgae(
  x: number,
  y: number,
  size: number,
  drift: number,
  speed: number,
  xpValue: number = 10
): Algae {
  return {
    x,
    y,
    size,
    drift,
    speed,
    xpValue,
  };
}
