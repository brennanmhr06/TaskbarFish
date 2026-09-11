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
  animPhase: number;
  hunger: number;
  maxAlgae: number;
  lastEatenTime: number;
  fullDuration: number;
  targetAlgae: number | null;
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
  phase: number,
  maxAlgae: number = 3,
  fullDuration: number = 180000
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
    animPhase: phase * 2.5,
    hunger: 0,
    maxAlgae,
    lastEatenTime: 0,
    fullDuration,
    targetAlgae: null,
  };
}
