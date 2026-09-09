import { Metrics } from '../drawing/Metrics';
import { Gfx } from '../drawing/Gfx';
import { Palette } from '../drawing/Palette';
import { drawFish, drawNavGlyph, drawLock } from './Sprites';

const FONT = '"Segoe UI", sans-serif';
const CARD_X = 10;
const CARD_W = Metrics.tankWidth - 20;

function rectRight(rect: { x: number; y: number; width: number; height: number }): number {
  return rect.x + rect.width;
}

function rectBottom(rect: { x: number; y: number; width: number; height: number }): number {
  return rect.y + rect.height;
}

export function drawMenuRenderer(ctx: CanvasRenderingContext2D, time: number): void {
  const panel = { x: 0, y: 0, width: Metrics.tankWidth, height: Metrics.menuHeight };

  const path = Gfx.roundedTopRect(panel, 16);
  const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  gradient.addColorStop(0, 'rgba(56, 118, 168, 0.97)');
  gradient.addColorStop(1, 'rgba(28, 78, 122, 0.97)');
  ctx.fillStyle = gradient;
  ctx.fill(path);

  ctx.strokeStyle = 'rgba(160, 210, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke(path);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  drawHeader(ctx);
  drawLevel(ctx);
  drawBasicFish(ctx, time);
  drawSize(ctx);
  drawPlacedFish(ctx);
  drawPlacedDecorations(ctx);
  drawDock(ctx);

  ctx.restore();
}

export function drawToggleButton(ctx: CanvasRenderingContext2D, menuOffset: number, menuOpen: boolean): void {
  const bounds = Metrics.buttonBounds(menuOffset);
  const path = Gfx.roundedRect(bounds, 7);
  const gradient = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + bounds.height);
  gradient.addColorStop(0, 'rgba(150, 215, 255, 1)');
  gradient.addColorStop(1, 'rgba(70, 145, 205, 1)');
  ctx.fillStyle = gradient;
  ctx.fill(path);
  ctx.strokeStyle = 'rgba(210, 240, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke(path);

  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2 + 1;
  const arrow = menuOpen
    ? [
        { x: cx, y: cy - 5 },
        { x: cx + 6, y: cy + 4 },
        { x: cx - 6, y: cy + 4 },
      ]
    : [
        { x: cx - 6, y: cy - 4 },
        { x: cx + 6, y: cy - 4 },
        { x: cx, y: cy + 5 },
      ];

  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.beginPath();
  ctx.moveTo(arrow[0].x, arrow[0].y);
  ctx.lineTo(arrow[1].x, arrow[1].y);
  ctx.lineTo(arrow[2].x, arrow[2].y);
  ctx.closePath();
  ctx.fill();
}

function drawHeader(ctx: CanvasRenderingContext2D): void {
  const headerRect = { x: CARD_X, y: 8, width: CARD_W, height: 40 };
  Gfx.glassCard(ctx, headerRect, 12);

  ctx.font = `bold 15px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText('Aquarium TaskBar', headerRect.x + 12, headerRect.y + headerRect.height / 2);

  const closeRect = Metrics.closeButtonRect();
  ctx.fillStyle = 'rgba(90, 150, 200, 0.95)';
  ctx.beginPath();
  ctx.ellipse(
    closeRect.x + closeRect.width / 2,
    closeRect.y + closeRect.height / 2,
    closeRect.width / 2,
    closeRect.height / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(245, 252, 255, 1)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(closeRect.x + 7, closeRect.y + 7);
  ctx.lineTo(rectRight(closeRect) - 7, rectBottom(closeRect) - 7);
  ctx.moveTo(rectRight(closeRect) - 7, closeRect.y + 7);
  ctx.lineTo(closeRect.x + 7, rectBottom(closeRect) - 7);
  ctx.stroke();
  ctx.textBaseline = 'alphabetic';
}

function drawLevel(ctx: CanvasRenderingContext2D): void {
  const card = { x: CARD_X, y: 54, width: CARD_W, height: 62 };
  Gfx.glassCard(ctx, card, 12);

  Gfx.sectionLabel(ctx, 'AQUARIUM LEVEL', card.x + 12, card.y + 8);

  ctx.font = `bold 20px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.textBaseline = 'top';
  ctx.fillText('0', card.x + 12, card.y + 24);

  const expBar = { x: card.x + 40, y: card.y + 32, width: 142, height: 10 };
  drawXpBar(ctx, expBar, 0);

  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.textBaseline = 'middle';
  ctx.fillText('0 / 100', expBar.x + expBar.width + 8, expBar.y + expBar.height / 2);

  const levelButtonRect = Metrics.levelButtonRect();
  const gradient = ctx.createLinearGradient(levelButtonRect.x, levelButtonRect.y, levelButtonRect.x, levelButtonRect.y + levelButtonRect.height);
  gradient.addColorStop(0, 'rgba(140, 200, 255, 1)');
  gradient.addColorStop(1, 'rgba(80, 150, 220, 1)');
  ctx.fillStyle = gradient;
  ctx.fill(Gfx.roundedRect(levelButtonRect, 8));
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke(Gfx.roundedRect(levelButtonRect, 8));
  Gfx.centeredText(ctx, 'LVL UP', `bold 10px ${FONT}`, 'rgba(255, 255, 255, 1)', levelButtonRect);
  ctx.textBaseline = 'alphabetic';
}

function drawXpBar(ctx: CanvasRenderingContext2D, track: { x: number; y: number; width: number; height: number }, progress: number): void {
  const path = Gfx.roundedRect(track, 5);
  ctx.fillStyle = 'rgba(18, 48, 78, 0.55)';
  ctx.fill(path);

  ctx.save();
  ctx.clip(path);
  const fillWidth = Math.max(8, Math.floor(track.width * progress));
  const fillGradient = ctx.createLinearGradient(track.x, track.y, track.x, track.y + track.height);
  fillGradient.addColorStop(0, 'rgba(130, 200, 255, 1)');
  fillGradient.addColorStop(1, 'rgba(70, 140, 200, 1)');
  ctx.fillStyle = fillGradient;
  ctx.fillRect(track.x, track.y, fillWidth, track.height);
  ctx.restore();

  ctx.strokeStyle = 'rgba(150, 200, 240, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke(path);
}

function drawBasicFish(ctx: CanvasRenderingContext2D, time: number): void {
  const card = { x: CARD_X, y: 122, width: CARD_W, height: 54 };
  Gfx.glassCard(ctx, card, 12);

  const iconWell = { x: card.x + 8, y: card.y + 8, width: 38, height: 38 };
  Gfx.insetWell(ctx, iconWell, 8);
  ctx.save();
  ctx.beginPath();
  ctx.rect(iconWell.x, iconWell.y, iconWell.width, iconWell.height);
  ctx.clip();
  drawFish(ctx, iconWell.x + 19, iconWell.y + 19, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', time, 0.35, 0.28, 0.72);
  ctx.restore();

  ctx.font = `bold 13px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.textBaseline = 'top';
  ctx.fillText('Basic Fish', iconWell.x + iconWell.width + 10, card.y + 12);

  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.fillText('Starter school', iconWell.x + iconWell.width + 10, card.y + 30);

  const count = { x: card.x + card.width - 48, y: card.y + 14, width: 36, height: 26 };
  Gfx.insetWell(ctx, count, 8);
  Gfx.centeredText(ctx, '×3', `bold 13px ${FONT}`, Palette.ink, count);
  ctx.textBaseline = 'alphabetic';
}

function drawSize(ctx: CanvasRenderingContext2D): void {
  const card = { x: CARD_X, y: 182, width: CARD_W, height: 52 };
  Gfx.glassCard(ctx, card, 12);
  Gfx.sectionLabel(ctx, 'AQUARIUM SIZE', card.x + 12, card.y + 8);

  ctx.textBaseline = 'top';
  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.fillText('2.6 m', card.x + 12, card.y + 24);
  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.fillText('wide', card.x + 62, card.y + 27);

  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.fillText('0.92 m', card.x + 108, card.y + 24);
  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.fillText('tall', card.x + 168, card.y + 27);

  const chip = { x: card.x + card.width - 86, y: card.y + 22, width: 74, height: 20 };
  Gfx.fillRound(ctx, chip, 10, 'rgba(30, 80, 120, 0.8)', 'rgba(15, 50, 80, 0.8)');
  Gfx.centeredText(ctx, 'COMPACT', `bold 10px ${FONT}`, 'rgba(255, 255, 255, 1)', chip);
  ctx.textBaseline = 'alphabetic';
}

function drawPlacedFish(ctx: CanvasRenderingContext2D): void {
  const card = { x: CARD_X, y: 240, width: CARD_W, height: 78 };
  Gfx.glassCard(ctx, card, 12);
  Gfx.sectionLabel(ctx, 'PLACED FISH', card.x + 12, card.y + 8);

  ctx.font = `bold 11px ${FONT}`;
  ctx.fillStyle = Palette.accent;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText('0 / 6', card.x + card.width - 12, card.y + 8);
  ctx.textAlign = 'left';

  drawSlotRow(ctx, card.y + 28);
}

function drawPlacedDecorations(ctx: CanvasRenderingContext2D): void {
  const card = { x: CARD_X, y: 324, width: CARD_W, height: 78 };
  Gfx.glassCard(ctx, card, 12);
  Gfx.sectionLabel(ctx, 'PLACED DECORATIONS', card.x + 12, card.y + 8);

  ctx.font = `bold 11px ${FONT}`;
  ctx.fillStyle = Palette.accent;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText('0 / 6', card.x + card.width - 12, card.y + 8);
  ctx.textAlign = 'left';

  drawSlotRow(ctx, card.y + 28);
}

function drawSlotRow(ctx: CanvasRenderingContext2D, y: number): void {
  const slotSize = 36;
  const gap = 8;
  const count = 6;
  const total = count * slotSize + (count - 1) * gap;
  const startX = CARD_X + (CARD_W - total) / 2;

  for (let i = 0; i < count; i++) {
    const slot = { x: startX + i * (slotSize + gap), y, width: slotSize, height: slotSize };
    Gfx.insetWell(ctx, slot, 8);
    const lockRect = {
      x: slot.x + slot.width / 2 - 7,
      y: slot.y + slot.height / 2 - 7,
      width: 14,
      height: 14,
    };
    drawLock(ctx, lockRect);
  }
}

function drawDock(ctx: CanvasRenderingContext2D): void {
  const dock = { x: CARD_X, y: 410, width: CARD_W, height: 42 };
  Gfx.glassCard(ctx, dock, 12);

  const iconSize = 30;
  const gap = 8;
  const totalButtons = 6;
  const totalWidth = totalButtons * iconSize + (totalButtons - 1) * gap;
  const startX = dock.x + (dock.width - totalWidth) / 2;
  const y = dock.y + (dock.height - iconSize) / 2;

  for (let i = 0; i < totalButtons; i++) {
    const iconRect = { x: startX + i * (iconSize + gap), y, width: iconSize, height: iconSize };
    const selected = i === 0;
    const path = Gfx.roundedRect(iconRect, 8);
    const gradient = ctx.createLinearGradient(iconRect.x, iconRect.y, iconRect.x, iconRect.y + iconRect.height);
    gradient.addColorStop(0, selected ? 'rgba(170, 220, 255, 1)' : 'rgba(120, 180, 230, 1)');
    gradient.addColorStop(1, selected ? 'rgba(90, 160, 220, 1)' : 'rgba(70, 130, 190, 1)');
    ctx.fillStyle = gradient;
    ctx.fill(path);
    ctx.strokeStyle = selected ? 'rgba(230, 250, 255, 0.95)' : 'rgba(140, 190, 230, 0.7)';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.stroke(path);
    drawNavGlyph(ctx, iconRect, i);
  }
}
