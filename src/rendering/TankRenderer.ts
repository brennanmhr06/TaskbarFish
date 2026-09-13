import { Aquarium } from '../scene/Aquarium';
import { Metrics } from '../drawing/Metrics';
import { Gfx } from '../drawing/Gfx';
import { Palette } from '../drawing/Palette';
import { drawFish } from './Sprites';
import { Algae } from '../entities/Bubble';

export function drawTankRenderer(ctx: CanvasRenderingContext2D, top: number, aquarium: Aquarium): void {
  ctx.imageSmoothingEnabled = false;
  const left = 0;
  const right = Metrics.tankWidth - 1;
  const backY = top;
  const frontTop = top + Metrics.lidDepth;
  const frontBottom = top + Metrics.lidDepth + Metrics.tankHeight - 1;

  const backLeft = { x: left + Metrics.lidInset, y: backY };
  const backRight = { x: right - Metrics.lidInset, y: backY };
  const frontTopLeft = { x: left, y: frontTop };
  const frontTopRight = { x: right, y: frontTop };
  const frontBottomLeft = { x: left, y: frontBottom };
  const frontBottomRight = { x: right, y: frontBottom };

  const innerBackLeft = { x: left + Metrics.lidInset + Metrics.glassThickness, y: backY + Metrics.glassThickness };
  const innerBackRight = { x: right - Metrics.lidInset - Metrics.glassThickness, y: backY + Metrics.glassThickness };
  const innerSeamLeft = { x: left + Metrics.glassThickness, y: frontTop };
  const innerSeamRight = { x: right - Metrics.glassThickness, y: frontTop };

  const frontWater = {
    x: left + Metrics.glassThickness,
    y: frontTop,
    width: right - Metrics.glassThickness - left - Metrics.glassThickness + 1,
    height: frontBottom - Metrics.bottomThickness - frontTop + 1,
  };

  drawFrontScene(ctx, frontWater, aquarium);
  drawGlassFrame(
    ctx,
    left,
    right,
    frontTop,
    frontBottom,
    backLeft,
    backRight,
    frontTopLeft,
    frontTopRight,
    frontBottomLeft,
    frontBottomRight,
    innerBackLeft,
    innerBackRight,
    innerSeamLeft,
    innerSeamRight,
    frontWater
  );
}

function drawFrontScene(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, aquarium: Aquarium): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(water.x, water.y, water.width, water.height);
  ctx.clip();

  const gradient = ctx.createLinearGradient(water.x, water.y, water.x, water.y + water.height);
  gradient.addColorStop(0, 'rgba(80, 150, 200, 0.96)');
  gradient.addColorStop(0.25, 'rgba(50, 110, 170, 0.94)');
  gradient.addColorStop(0.5, 'rgba(35, 85, 140, 0.92)');
  gradient.addColorStop(0.75, 'rgba(25, 70, 120, 0.91)');
  gradient.addColorStop(1, 'rgba(15, 40, 80, 1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(water.x, water.y, water.width, water.height);

  Gfx.dither(ctx, water, 'rgba(8, 24, 40, 0.14)');
  Gfx.scanlines(ctx, water, 0.07);

  drawLightRays(ctx, water, aquarium.time);
  drawCaustics(ctx, water, aquarium.time);
  drawPlants(ctx, water, aquarium.time);
  drawSand(ctx, water);
  drawFishSchool(ctx, water, aquarium);
  drawAlgae(ctx, water, aquarium.algae, aquarium.time);
  drawSurface(ctx, water, aquarium.time);
  drawGlassGlare(ctx, water);

  ctx.restore();
}

function drawLightRays(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, time: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(water.x, water.y, water.width, water.height);
  ctx.clip();

  const rayGradient = ctx.createLinearGradient(water.x, water.y, water.x, water.y + water.height);
  rayGradient.addColorStop(0, 'rgba(170, 220, 255, 0.31)');
  rayGradient.addColorStop(1, 'rgba(120, 180, 220, 0.08)');

  for (let i = 0; i < 6; i++) {
    const offset = Math.sin(time * 0.4 + i * 1.5) * 10;
    const x = water.x + water.width * (0.15 + i * 0.14) + offset;
    const width = 18 + Math.sin(time * 0.6 + i) * 6;

    ctx.fillStyle = rayGradient;
    ctx.fillRect(x, water.y, width, water.height);
  }

  ctx.restore();
}

function drawCaustics(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, time: number): void {
  ctx.strokeStyle = 'rgba(110, 170, 230, 0.78)';
  ctx.lineWidth = 2.8;

  for (let band = 0; band < 5; band++) {
    const y = water.y + 18 + band * 22;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const x = water.x + i * (water.width / 11);
      const wave = Math.sin(time * 2.0 + i * 1.3 + band * 0.9) * 5.0;
      const secondaryWave = Math.cos(time * 1.4 + i * 0.8 + band) * 2.5;
      points.push({ x, y: y + wave + secondaryWave });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(80, 140, 190, 0.55)';
  ctx.lineWidth = 1.8;

  for (let band = 0; band < 7; band++) {
    const y = water.y + 28 + band * 15;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const x = water.x + i * (water.width / 7) + (band % 2) * 18;
      const wave = Math.sin(time * 2.5 + i * 1.6 + band * 1.4) * 3.0;
      points.push({ x, y: y + wave });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
}

function drawPlants(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, time: number): void {
  drawSeaweed(ctx, water, water.x + 18, 42, 'rgba(50, 150, 105, 0.67)', 1.2, time);
  drawSeaweed(ctx, water, water.x + 32, 36, 'rgba(35, 130, 88, 0.63)', 0.8, time);
  drawSeaweed(ctx, water, water.x + water.width - 45, 40, 'rgba(55, 155, 108, 0.65)', 1.5, time);
  drawSeaweed(ctx, water, water.x + water.width - 28, 34, 'rgba(30, 120, 78, 0.61)', 0.5, time);
  drawSeaweed(ctx, water, water.x + 80, 32, 'rgba(45, 135, 92, 0.63)', 1.0, time);
  drawSeaweed(ctx, water, water.x + water.width - 85, 30, 'rgba(40, 128, 89, 0.62)', 1.3, time);
  drawSeaweed(ctx, water, water.x + 140, 28, 'rgba(38, 132, 90, 0.63)', 0.7, time);
}

function drawSeaweed(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, x: number, height: number, color: string, phase: number, time: number): void {
  const sand = water.y + water.height - 10;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const sway = Math.sin(time * 1.5 + phase + t * 2.5) * (5 + t * 6);
    const secondarySway = Math.cos(time * 1.2 + phase * 1.3 + t * 1.8) * 2;
    points.push({ x: x + sway + secondarySway, y: sand - height * t });
  }

  const colorRgba = parseRgba(color);
  const leafColor = `rgba(${colorRgba.r + 20}, ${colorRgba.g + 30}, ${colorRgba.b + 25}, ${colorRgba.a})`;

  for (let i = 0; i < points.length - 1; i++) {
    const width = 5;
    const rectY = Math.min(points[i].y, points[i + 1].y);
    const rectHeight = Math.abs(points[i].y - points[i + 1].y) + 2;
    ctx.fillStyle = color;
    ctx.fillRect(points[i].x - width / 2, rectY, width, rectHeight);

    if (i % 2 === 0 && i > 0) {
      const leafX = points[i].x + width;
      const leafY = rectY + rectHeight / 2;
      ctx.fillStyle = leafColor;
      ctx.fillRect(leafX, leafY - 3, 4, 6);
      ctx.fillRect(leafX - 8, leafY - 2, 4, 5);
    }
  }
}

function drawSand(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }): void {
  const sandHeight = 18;
  const sandTop = water.y + water.height - sandHeight;
  const sandRect = { x: water.x, y: sandTop, width: water.width, height: sandHeight };

  const sandGradient = ctx.createLinearGradient(sandRect.x, sandRect.y, sandRect.x, sandRect.y + sandRect.height);
  sandGradient.addColorStop(0, 'rgba(220, 180, 120, 0.94)');
  sandGradient.addColorStop(1, 'rgba(200, 160, 100, 0.9)');
  ctx.fillStyle = sandGradient;
  ctx.fillRect(sandRect.x, sandRect.y, sandRect.width, sandRect.height);

  const sandDark = 'rgba(190, 150, 90, 0.82)';
  const sandMedium = 'rgba(175, 135, 85, 0.76)';
  const sandLight = 'rgba(190, 200, 140, 0.75)';
  const sandHighlight = 'rgba(175, 230, 160, 0.67)';

  for (let i = 0; i < water.width; i += 5) {
    const textureHeight = 2 + (i % 5);
    const xOffset = (i % 4) * 1;
    ctx.fillStyle = sandDark;
    ctx.fillRect(water.x + i + xOffset, sandTop + textureHeight, 4, textureHeight);

    if (i % 3 === 0) {
      ctx.fillStyle = sandMedium;
      ctx.fillRect(water.x + i + 1, sandTop + sandHeight - 4, 3, 3);
    }

    if (i % 2 === 0) {
      ctx.fillStyle = sandLight;
      ctx.fillRect(water.x + i + 2, sandTop + sandHeight - 2, 2, 2);
    }

    if (i % 7 === 0) {
      ctx.fillStyle = sandHighlight;
      ctx.fillRect(water.x + i + 1, sandTop + 1, 2, 2);
    }
  }

  const pebble = 'rgba(170, 130, 90, 0.75)';
  const pebbleDark = 'rgba(150, 110, 80, 0.67)';
  const pebbleMedium = 'rgba(160, 120, 85, 0.71)';
  const pebbleHi = 'rgba(160, 230, 250, 0.63)';

  ctx.fillStyle = pebble;
  ctx.fillRect(water.x + 35, sandTop + 3, 10, 6);
  ctx.fillStyle = pebbleDark;
  ctx.fillRect(water.x + 37, sandTop + 5, 6, 4);
  ctx.fillStyle = pebbleMedium;
  ctx.fillRect(water.x + 36, sandTop + 4, 4, 3);
  ctx.fillStyle = pebbleHi;
  ctx.fillRect(water.x + 38, sandTop + 3, 3, 2);

  ctx.fillStyle = pebble;
  ctx.fillRect(water.x + 90, sandTop + 5, 9, 5);
  ctx.fillStyle = pebbleDark;
  ctx.fillRect(water.x + 92, sandTop + 6, 5, 4);
  ctx.fillStyle = pebbleMedium;
  ctx.fillRect(water.x + 91, sandTop + 5, 4, 3);
  ctx.fillStyle = pebbleHi;
  ctx.fillRect(water.x + 93, sandTop + 5, 2, 2);

  ctx.fillStyle = pebble;
  ctx.fillRect(water.x + 145, sandTop + 4, 11, 6);
  ctx.fillStyle = pebbleDark;
  ctx.fillRect(water.x + 147, sandTop + 6, 7, 4);
  ctx.fillStyle = pebbleMedium;
  ctx.fillRect(water.x + 146, sandTop + 5, 5, 3);
  ctx.fillStyle = pebbleHi;
  ctx.fillRect(water.x + 148, sandTop + 4, 4, 2);

  ctx.fillStyle = pebble;
  ctx.fillRect(water.x + water.width - 65, sandTop + 5, 8, 5);
  ctx.fillStyle = pebbleDark;
  ctx.fillRect(water.x + water.width - 63, sandTop + 6, 4, 4);
  ctx.fillStyle = pebbleMedium;
  ctx.fillRect(water.x + water.width - 64, sandTop + 5, 3, 3);
  ctx.fillStyle = pebbleHi;
  ctx.fillRect(water.x + water.width - 63, sandTop + 5, 2, 2);

  ctx.fillStyle = pebble;
  ctx.fillRect(water.x + water.width - 30, sandTop + 3, 9, 6);
  ctx.fillStyle = pebbleDark;
  ctx.fillRect(water.x + water.width - 28, sandTop + 5, 5, 4);
  ctx.fillStyle = pebbleMedium;
  ctx.fillRect(water.x + water.width - 29, sandTop + 4, 4, 3);
  ctx.fillStyle = pebbleHi;
  ctx.fillRect(water.x + water.width - 28, sandTop + 3, 3, 2);

  const shell = 'rgba(250, 240, 210, 0.71)';
  const shellPink = 'rgba(245, 200, 180, 0.67)';
  const shellBlue = 'rgba(230, 245, 215, 0.67)';

  ctx.fillStyle = shell;
  ctx.fillRect(water.x + 60, sandTop + 7, 4, 3);
  ctx.fillStyle = shellPink;
  ctx.fillRect(water.x + 175, sandTop + 6, 3, 3);
  ctx.fillStyle = shellBlue;
  ctx.fillRect(water.x + water.width - 45, sandTop + 8, 4, 3);
  ctx.fillStyle = shell;
  ctx.fillRect(water.x + 120, sandTop + 9, 3, 2);
  ctx.fillStyle = shellPink;
  ctx.fillRect(water.x + water.width - 85, sandTop + 7, 3, 2);

  const starfish = 'rgba(230, 100, 120, 0.73)';
  ctx.fillStyle = starfish;
  ctx.fillRect(water.x + 200, sandTop + 5, 4, 4);
  ctx.fillRect(water.x + 199, sandTop + 4, 2, 2);
  ctx.fillRect(water.x + 203, sandTop + 4, 2, 2);
  ctx.fillRect(water.x + 201, sandTop + 6, 2, 2);
}

function drawFishSchool(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, aquarium: Aquarium): void {
  for (const fish of aquarium.fish) {
    const y = fish.y + Math.sin(aquarium.time * fish.bobSpeed + fish.phase) * fish.bob;
    drawFish(
      ctx,
      water.x + fish.x,
      water.y + y,
      fish.facingRight,
      fish.body,
      fish.fin,
      aquarium.time,
      fish.animPhase,
      0.35
    );
  }
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function drawAlgae(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, algae: Algae[], time: number): void {
  for (const alg of algae) {
    const x = water.x + alg.x;
    const y = water.y + alg.y;
    const size = alg.size;

    const sway = Math.sin(time * 1.5 + alg.x * 0.1) * 2;
    
    const stemColor = 'rgba(60, 140, 60, 0.7)';
    const leafColor = 'rgba(80, 180, 80, 0.6)';
    const leafHighlight = 'rgba(100, 200, 100, 0.5)';
    
    ctx.fillStyle = stemColor;
    ctx.fillRect(x + size/2 - 1, y, 2, size);
    
    const leafCount = Math.floor(size / 2);
    for (let i = 0; i < leafCount; i++) {
      const leafY = y + (i * size / leafCount);
      const leafSway = sway * (i / leafCount);
      const side = i % 2 === 0 ? 1 : -1;
      
      ctx.fillStyle = leafColor;
      ctx.fillRect(x + size/2 + leafSway * side, leafY, size/2 * side, 2);
      
      ctx.fillStyle = leafHighlight;
      ctx.fillRect(x + size/2 + leafSway * side + (side > 0 ? 0 : -1), leafY + 1, size/4 * side, 1);
    }
    
    const glowGradient = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size);
    glowGradient.addColorStop(0, 'rgba(100, 200, 100, 0.3)');
    glowGradient.addColorStop(1, 'rgba(100, 200, 100, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(x - size/2, y - size/2, size * 2, size * 2);
    
    // Draw text shadow for better readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+${formatNumber(alg.xpValue)} XP`, x + size/2 + 1, y - 1);
    
    ctx.fillStyle = 'rgba(255, 255, 200, 1)';
    ctx.fillText(`+${formatNumber(alg.xpValue)} XP`, x + size/2, y - 2);
  }
}

function drawSurface(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }, time: number): void {
  ctx.fillStyle = '#5aa8d8';
  ctx.fillRect(water.x, water.y, water.width, 3);
  ctx.fillStyle = '#9ad8ff';
  ctx.fillRect(water.x, water.y, water.width, 1);

  ctx.fillStyle = '#7ec8f0';
  for (let i = 0; i < water.width; i += 4) {
    const waveHeight = Math.sin(time * 2 + i * 0.2) > 0 ? 3 : 2;
    ctx.fillRect(water.x + i, water.y + 2, 4, waveHeight);
  }
}

function drawGlassGlare(ctx: CanvasRenderingContext2D, water: { x: number; y: number; width: number; height: number }): void {
  const glareGradient = ctx.createLinearGradient(water.x, water.y, water.x + 12, water.y);
  glareGradient.addColorStop(0, 'rgba(100, 160, 220, 0.47)');
  glareGradient.addColorStop(1, 'rgba(60, 80, 140, 0.24)');

  for (let i = 0; i < water.height; i += 6) {
    const glareWidth = 10 + (i % 5);
    const glareAlpha = 120 - Math.floor((i / water.height) * 40);
    ctx.fillStyle = `rgba(90, 140, 200, ${glareAlpha / 255})`;
    ctx.fillRect(water.x, water.y + i, glareWidth, 4);
  }

  const edgeShadeGradient = ctx.createLinearGradient(water.x + water.width - 10, water.y, water.x + water.width, water.y);
  edgeShadeGradient.addColorStop(0, 'rgba(40, 70, 120, 0.31)');
  edgeShadeGradient.addColorStop(1, 'rgba(30, 60, 100, 0.16)');

  for (let i = 0; i < water.height; i += 5) {
    const shadeWidth = 8 + (i % 4);
    const shadeAlpha = 150 - Math.floor((i / water.height) * 50);
    ctx.fillStyle = `rgba(40, 70, 120, ${shadeAlpha / 255})`;
    ctx.fillRect(water.x + water.width - shadeWidth, water.y + i, shadeWidth, 4);
  }

  const diagonalReflection = ctx.createLinearGradient(
    water.x + water.width * 0.3,
    water.y,
    water.x + water.width * 0.7,
    water.y + water.height
  );
  diagonalReflection.addColorStop(0, 'rgba(40, 120, 180, 0.16)');
  diagonalReflection.addColorStop(1, 'rgba(10, 80, 140, 0.08)');

  const reflectionRect = {
    x: water.x + Math.floor(water.width * 0.25),
    y: water.y + 10,
    width: Math.floor(water.width * 0.5),
    height: water.height - 20,
  };

  ctx.fillStyle = diagonalReflection;
  ctx.fillRect(reflectionRect.x, reflectionRect.y, reflectionRect.width, reflectionRect.height);

  ctx.fillStyle = 'rgba(30, 100, 160, 0.12)';
  for (let i = 0; i < 3; i++) {
    const y = water.y + 20 + i * 30;
    const streakWidth = Math.floor(water.width * 0.6);
    const x = water.x + Math.floor(water.width * 0.2);
    ctx.fillRect(x, y, streakWidth, 2);
  }
}

function drawGlassFrame(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  frontTop: number,
  frontBottom: number,
  backLeft: { x: number; y: number },
  backRight: { x: number; y: number },
  frontTopLeft: { x: number; y: number },
  frontTopRight: { x: number; y: number },
  frontBottomLeft: { x: number; y: number },
  frontBottomRight: { x: number; y: number },
  innerBackLeft: { x: number; y: number },
  innerBackRight: { x: number; y: number },
  innerSeamLeft: { x: number; y: number },
  innerSeamRight: { x: number; y: number },
  frontWater: { x: number; y: number; width: number; height: number }
): void {
  const pillarHeight = frontBottom - Metrics.bottomThickness - frontTop + 1;

  ctx.fillStyle = '#1c4a72';
  ctx.beginPath();
  ctx.moveTo(backLeft.x, backLeft.y);
  ctx.lineTo(backRight.x, backRight.y);
  ctx.lineTo(innerBackRight.x, innerBackRight.y);
  ctx.lineTo(innerBackLeft.x, innerBackLeft.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2a6aa0';
  ctx.beginPath();
  ctx.moveTo(backLeft.x, backLeft.y);
  ctx.lineTo(frontTopLeft.x, frontTopLeft.y);
  ctx.lineTo(innerSeamLeft.x, innerSeamLeft.y);
  ctx.lineTo(innerBackLeft.x, innerBackLeft.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1a4a70';
  ctx.beginPath();
  ctx.moveTo(backRight.x, backRight.y);
  ctx.lineTo(frontTopRight.x, frontTopRight.y);
  ctx.lineTo(innerSeamRight.x, innerSeamRight.y);
  ctx.lineTo(innerBackRight.x, innerBackRight.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#40a0d0';
  ctx.fillRect(left, frontTop, Metrics.glassThickness, pillarHeight);

  ctx.fillStyle = '#2a6aa0';
  ctx.fillRect(right - Metrics.glassThickness, frontTop, Metrics.glassThickness + 1, pillarHeight);

  ctx.fillStyle = '#143250';
  ctx.fillRect(left, frontBottom - Metrics.bottomThickness, right - left + 1, Metrics.bottomThickness);

  ctx.fillStyle = Palette.pixelCyan;
  ctx.fillRect(left + Metrics.glassThickness, frontBottom - Metrics.bottomThickness, right - left - 2 * Metrics.glassThickness, 2);

  ctx.lineJoin = 'miter';
  ctx.strokeStyle = Palette.pixelNavy;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(Math.round(backLeft.x), Math.round(backLeft.y));
  ctx.lineTo(Math.round(backRight.x), Math.round(backRight.y));
  ctx.lineTo(Math.round(frontTopRight.x), Math.round(frontTopRight.y));
  ctx.lineTo(Math.round(frontBottomRight.x), Math.round(frontBottomRight.y));
  ctx.lineTo(Math.round(frontBottomLeft.x), Math.round(frontBottomLeft.y));
  ctx.lineTo(Math.round(frontTopLeft.x), Math.round(frontTopLeft.y));
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = Palette.pixelCyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = Palette.pixelNavy;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(Math.round(innerBackLeft.x), Math.round(innerBackLeft.y));
  ctx.lineTo(Math.round(innerBackRight.x), Math.round(innerBackRight.y));
  ctx.lineTo(Math.round(innerSeamRight.x), Math.round(innerSeamRight.y));
  ctx.lineTo(Math.round(innerSeamLeft.x), Math.round(innerSeamLeft.y));
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.round(innerSeamLeft.x), Math.round(innerSeamLeft.y));
  ctx.lineTo(Math.round(frontWater.x), Math.round(frontWater.y + frontWater.height - 1));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.round(innerSeamRight.x), Math.round(innerSeamRight.y));
  ctx.lineTo(Math.round(frontWater.x + frontWater.width - 1), Math.round(frontWater.y + frontWater.height - 1));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(Math.round(frontWater.x), Math.round(frontWater.y + frontWater.height - 1));
  ctx.lineTo(Math.round(frontWater.x + frontWater.width - 1), Math.round(frontWater.y + frontWater.height - 1));
  ctx.stroke();

  ctx.fillStyle = Palette.pixelCyan;
  ctx.fillRect(frontTopLeft.x + 2, frontTopLeft.y + 2, 6, 2);
  ctx.fillRect(frontTopLeft.x + 2, frontTopLeft.y + 2, 2, 6);
}

function parseRgba(color: string): { r: number; g: number; b: number; a: number } {
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
