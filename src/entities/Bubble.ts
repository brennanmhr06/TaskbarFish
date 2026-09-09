export interface Bubble {
  x: number;
  y: number;
  drift: number;
  speed: number;
  size: number;
}

export function createBubble(
  x: number,
  y: number,
  size: number,
  drift: number,
  speed: number
): Bubble {
  return {
    x,
    y,
    size,
    drift,
    speed,
  };
}
