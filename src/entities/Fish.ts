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
  hunger: number; // Current hunger level (0 = full, maxAlgae = hungry)
  maxAlgae: number; // How many algae it can eat before getting full
  lastEatenTime: number; // Timestamp when last ate
  fullDuration: number; // How long (in ms) it stays full after eating
  targetAlgae: number | null; // Index of algae it's currently chasing
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
  fullDuration: number = 180000 // 3 minutes in milliseconds
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
    hunger: 0,
    maxAlgae,
    lastEatenTime: 0,
    fullDuration,
    targetAlgae: null,
  };
}
