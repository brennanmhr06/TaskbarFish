import { Fish, createFish } from '../entities/Fish';
import { Algae, createAlgae } from '../entities/Bubble';
import { Metrics } from '../drawing/Metrics';

export interface Aquarium {
  time: number;
  algae: Algae[];
  fish: Fish[];
  totalXP: number;
  lastAlgaeSpawn: number;
  algaeSpawnInterval: number;
}

export function createAquarium(): Aquarium {
  return {
    time: 0,
    algae: [],
    fish: [],
    totalXP: 0,
    lastAlgaeSpawn: 0,
    algaeSpawnInterval: 5000, // Spawn algae every 5 seconds
  };
}

export function resetAquarium(aquarium: Aquarium): void {
  const waterHeight = Metrics.tankHeight - Metrics.bottomThickness;

  aquarium.algae = [
    createAlgae(36, waterHeight - 18, 4, 0.15, -0.1, 15),
    createAlgae(78, waterHeight - 28, 3, -0.12, 0.08, 12),
    createAlgae(142, waterHeight - 16, 5, 0.18, -0.12, 20),
    createAlgae(198, waterHeight - 32, 3, -0.14, 0.1, 12),
    createAlgae(246, waterHeight - 20, 4, 0.16, -0.08, 15),
  ];

  aquarium.fish = [
    createFish(70, 42, 16, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 2.2, 0.9, 0.2, 3, 180000),
    createFish(190, 58, 11, false, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 1.8, 0.7, 1.1, 3, 180000),
    createFish(120, 32, 13, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 2.0, 0.8, 2.4, 3, 180000),
  ];
  
  aquarium.totalXP = 0;
  aquarium.lastAlgaeSpawn = aquarium.time * 1000;
}

export function containAquarium(aquarium: Aquarium): void {
  const waterWidth = Metrics.tankWidth - 2 * Metrics.glassThickness;
  const waterHeight = Metrics.tankHeight - Metrics.bottomThickness;
  const margin = 28;

  for (const fish of aquarium.fish) {
    fish.x = Math.min(Math.max(fish.x, margin), Math.max(margin, waterWidth - margin));
    fish.y = Math.min(Math.max(fish.y, 16), Math.max(16, waterHeight - 24));
  }

  for (const algae of aquarium.algae) {
    algae.x = Math.min(Math.max(algae.x, 8), Math.max(8, waterWidth - algae.size - 8));
    algae.y = Math.min(Math.max(algae.y, 6), Math.max(6, waterHeight - 16));
  }
}

export function tickAquarium(aquarium: Aquarium, dt: number): void {
  aquarium.time += dt;
  const currentTime = aquarium.time * 1000;

  const waterWidth = Metrics.tankWidth - 2 * Metrics.glassThickness;
  const waterHeight = Metrics.tankHeight - Metrics.bottomThickness;
  const margin = 28;

  // Spawn new algae periodically
  if (currentTime - aquarium.lastAlgaeSpawn > aquarium.algaeSpawnInterval) {
    if (aquarium.algae.length < 15) { // Max 15 algae at once
      const algaeX = 20 + Math.random() * (waterWidth - 40);
      const algaeY = 20 + Math.random() * (waterHeight - 40); // Spawn throughout the tank
      const algaeSize = 3 + Math.random() * 3;
      const algaeXP = Math.round(15 + algaeSize * 3); // Increased XP values
      // Random drift direction and gentle floating speed
      const driftX = (Math.random() - 0.5) * 0.4;
      const driftY = (Math.random() - 0.5) * 0.3;
      aquarium.algae.push(createAlgae(algaeX, algaeY, algaeSize, driftX, driftY, algaeXP));
      aquarium.lastAlgaeSpawn = currentTime;
    }
  }

  // Update algae movement
  for (const algae of aquarium.algae) {
    algae.x += algae.drift * dt;
    algae.y += algae.speed * dt;

    // Bounce off walls
    if (algae.x < 8 || algae.x > waterWidth - algae.size - 8) {
      algae.drift *= -1;
    }

    // Bounce off top and bottom
    if (algae.y < 6 || algae.y > waterHeight - algae.size - 6) {
      algae.speed *= -1;
    }
  }

  // Update fish behavior
  for (const fish of aquarium.fish) {
    // Check if fish can eat more algae
    const canEatMore = fish.hunger < fish.maxAlgae;
    
    if (canEatMore) {
      // Find nearest algae
      let nearestAlgaeIndex = -1;
      let nearestDistance = Infinity;
      
      for (let i = 0; i < aquarium.algae.length; i++) {
        const algae = aquarium.algae[i];
        const dx = algae.x - fish.x;
        const dy = algae.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestAlgaeIndex = i;
        }
      }
      
      if (nearestAlgaeIndex !== -1) {
        // Chase the algae
        const algae = aquarium.algae[nearestAlgaeIndex];
        const dx = algae.x - fish.x;
        const dy = algae.y - fish.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          // Move towards algae
          const moveSpeed = fish.speed * 1.2; // Move slightly faster when chasing
          fish.x += (dx / distance) * moveSpeed * dt;
          fish.y += (dy / distance) * moveSpeed * dt;
          
          // Update facing direction
          fish.facingRight = dx > 0;
          
          fish.targetAlgae = nearestAlgaeIndex;
        } else {
          // Eat the algae
          aquarium.totalXP += algae.xpValue;
          fish.hunger++;
          fish.lastEatenTime = currentTime;
          aquarium.algae.splice(nearestAlgaeIndex, 1);
          fish.targetAlgae = null;
        }
      } else {
        // Normal swimming when no algae available
        fish.x += (fish.facingRight ? fish.speed : -fish.speed) * dt;
        if (fish.x > waterWidth - margin) {
          fish.x = waterWidth - margin;
          fish.facingRight = false;
        } else if (fish.x < margin) {
          fish.x = margin;
          fish.facingRight = true;
        }
        fish.targetAlgae = null;
      }
    } else {
      // Fish is full, normal swimming
      fish.x += (fish.facingRight ? fish.speed : -fish.speed) * dt;
      if (fish.x > waterWidth - margin) {
        fish.x = waterWidth - margin;
        fish.facingRight = false;
      } else if (fish.x < margin) {
        fish.x = margin;
        fish.facingRight = true;
      }
      fish.targetAlgae = null;
      
      // Reset hunger when full duration is over
      if (currentTime - fish.lastEatenTime >= fish.fullDuration) {
        fish.hunger = 0; // Reset hunger when no longer full
      }
    }
  }
}
