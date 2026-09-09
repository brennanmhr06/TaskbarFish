export interface Fish {
  x: number;
  y: number;
  speed: number;
  bob: number;
  bobSpeed: number;
  phase: number;
  facingRight: boolean;
  body: string;
  fin: string;
  animationPhase: number;
}

export function createFish(
  x: number,
  y: number,
  speed: number,
  facingRight: boolean,
  body: string,
  fin: string,
  bob: number,
  bobSpeed: number,
  phase: number
): Fish {
  return {
    x,
    y,
    speed,
    facingRight,
    body,
    fin,
    bob,
    bobSpeed,
    phase,
    animationPhase: phase * 2.5,
  };
}
