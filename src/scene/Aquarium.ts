import { Fish, createFish } from '../entities/Fish';
import { Bubble, createBubble } from '../entities/Bubble';
import { Metrics } from '../drawing/Metrics';

export interface Aquarium {
  time: number;
  bubbles: Bubble[];
  fish: Fish[];
}

export function createAquarium(): Aquarium {
  return {
    time: 0,
    bubbles: [],
    fish: [],
  };
}

export function resetAquarium(aquarium: Aquarium): void {
  const waterHeight = Metrics.tankHeight - Metrics.bottomThickness;

  aquarium.bubbles = [
    createBubble(36, waterHeight - 18, 4, 0.25, -0.42),
    createBubble(78, waterHeight - 28, 3, -0.18, -0.36),
    createBubble(142, waterHeight - 16, 5, 0.22, -0.48),
    createBubble(198, waterHeight - 32, 3, -0.16, -0.4),
    createBubble(246, waterHeight - 20, 4, 0.2, -0.34),
  ];

  aquarium.fish = [
    createFish(70, 42, 16, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 2.2, 0.9, 0.2),
    createFish(190, 58, 11, false, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 1.8, 0.7, 1.1),
    createFish(120, 32, 13, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 2.0, 0.8, 2.4),
  ];
}

export function tickAquarium(aquarium: Aquarium, dt: number): void {
  aquarium.time += dt;

  const waterWidth = Metrics.tankWidth - 2 * Metrics.glassThickness;
  const waterHeight = Metrics.tankHeight - Metrics.bottomThickness;
  const margin = 28;

  for (const bubble of aquarium.bubbles) {
    bubble.x += bubble.drift * dt * 60;
    bubble.y += bubble.speed * dt * 60;

    if (bubble.x < 8 || bubble.x > waterWidth - bubble.size - 8) {
      bubble.drift *= -1;
    }

    if (bubble.y < 6) {
      bubble.y = waterHeight - 16;
      bubble.x = 24 + ((aquarium.time * 37 + bubble.size * 13) % (waterWidth - 48));
    }
  }

  for (const fish of aquarium.fish) {
    fish.x += (fish.facingRight ? fish.speed : -fish.speed) * dt;
    if (fish.x > waterWidth - margin) {
      fish.x = waterWidth - margin;
      fish.facingRight = false;
    } else if (fish.x < margin) {
      fish.x = margin;
      fish.facingRight = true;
    }
  }
}
