import { Metrics } from '../drawing/Metrics';
import { Gfx } from '../drawing/Gfx';
import { Palette } from '../drawing/Palette';
import { drawFish, drawNavGlyph, drawLock } from './Sprites';

const FONT = Palette.pixelFont;
const CARD_X = 10;

function cardWidth(): number {
  return Metrics.cardWidth();
}

function rectRight(rect: { x: number; y: number; width: number; height: number }): number {
  return rect.x + rect.width;
}

function rectBottom(rect: { x: number; y: number; width: number; height: number }): number {
  return rect.y + rect.height;
}

export function drawMenuRenderer(ctx: CanvasRenderingContext2D, time: number): void {
  ctx.imageSmoothingEnabled = false;
  const panel = { x: 0, y: 0, width: Metrics.tankWidth, height: Metrics.menuHeight };

  ctx.fillStyle = Palette.pixelShadow;
  ctx.fillRect(panel.x + 4, panel.y + 4, panel.width, panel.height);

  const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
  gradient.addColorStop(0, '#2a6aa0');
  gradient.addColorStop(1, '#12365c');
  ctx.fillStyle = gradient;
  ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

  Gfx.scanlines(ctx, panel, 0.1);

  ctx.strokeStyle = Palette.pixelCyan;
  ctx.lineWidth = 4;
  ctx.strokeRect(panel.x + 2, panel.y + 2, panel.width - 4, panel.height - 4);
  ctx.strokeStyle = Palette.pixelNavy;
  ctx.lineWidth = 3;
  ctx.strokeRect(panel.x + 5, panel.y + 5, panel.width - 10, panel.height - 10);

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
  Gfx.pixelBevel(ctx, bounds, 'rgba(110, 200, 255, 1)', 'rgba(47, 124, 190, 1)', false);

  const cx = Math.round(bounds.x + bounds.width / 2);
  const cy = Math.round(bounds.y + bounds.height / 2);
  ctx.fillStyle = '#f4fbff';
  if (menuOpen) {
    ctx.fillRect(cx - 5, cy + 2, 10, 3);
    ctx.fillRect(cx - 3, cy - 1, 6, 3);
    ctx.fillRect(cx - 1, cy - 4, 2, 3);
  } else {
    ctx.fillRect(cx - 5, cy - 4, 10, 3);
    ctx.fillRect(cx - 3, cy - 1, 6, 3);
    ctx.fillRect(cx - 1, cy + 2, 2, 3);
  }
}

function drawHeader(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const headerRect = { x: CARD_X, y: 8, width: CARD_W, height: 40 };
  Gfx.glassCard(ctx, headerRect, 2);

  ctx.font = `bold 12px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText('AQUARIUM TASKBAR', headerRect.x + 12, headerRect.y + headerRect.height / 2);

  const closeRect = Metrics.closeButtonRect();
  ctx.fillStyle = Palette.pixelShadow;
  ctx.fillRect(closeRect.x + 2, closeRect.y + 2, closeRect.width, closeRect.height);
  ctx.fillStyle = Palette.pixelCoral;
  ctx.fillRect(closeRect.x, closeRect.y, closeRect.width, closeRect.height);
  ctx.fillStyle = '#f09880';
  ctx.fillRect(closeRect.x + 2, closeRect.y + 2, closeRect.width - 4, 2);
  ctx.strokeStyle = Palette.pixelNavy;
  ctx.lineWidth = 3;
  ctx.strokeRect(closeRect.x + 1.5, closeRect.y + 1.5, closeRect.width - 3, closeRect.height - 3);

  ctx.strokeStyle = '#fff8f0';
  ctx.lineWidth = 3;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(closeRect.x + 6, closeRect.y + 6);
  ctx.lineTo(rectRight(closeRect) - 6, rectBottom(closeRect) - 6);
  ctx.moveTo(rectRight(closeRect) - 6, closeRect.y + 6);
  ctx.lineTo(closeRect.x + 6, rectBottom(closeRect) - 6);
  ctx.stroke();
  ctx.textBaseline = 'alphabetic';
}

function drawLevel(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const card = { x: CARD_X, y: 54, width: CARD_W, height: 62 };
  Gfx.glassCard(ctx, card, 2);

  Gfx.sectionLabel(ctx, 'AQUARIUM LEVEL', card.x + 12, card.y + 8);

  ctx.font = `bold 20px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.textBaseline = 'top';
  ctx.fillText('0', card.x + 12, card.y + 24);

  const levelButtonRect = Metrics.levelButtonRect();
  const expBar = {
    x: card.x + 40,
    y: card.y + 32,
    width: Math.max(80, levelButtonRect.x - (card.x + 40) - 58),
    height: 10,
  };
  drawXpBar(ctx, expBar, 0);

  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.textBaseline = 'middle';
  ctx.fillText('0 / 100', expBar.x + expBar.width + 8, expBar.y + expBar.height / 2);

  Gfx.pixelBevel(ctx, levelButtonRect, 'rgba(110, 200, 255, 1)', 'rgba(47, 124, 190, 1)');
  Gfx.centeredText(ctx, 'LVL UP', `bold 10px ${FONT}`, 'rgba(255, 255, 255, 1)', levelButtonRect);
  ctx.textBaseline = 'alphabetic';
}

function drawXpBar(ctx: CanvasRenderingContext2D, track: { x: number; y: number; width: number; height: number }, progress: number): void {
  ctx.fillStyle = '#082038';
  ctx.fillRect(track.x, track.y, track.width, track.height);
  ctx.strokeStyle = Palette.pixelNavy;
  ctx.lineWidth = 2;
  ctx.strokeRect(track.x + 1, track.y + 1, track.width - 2, track.height - 2);

  const fillWidth = Math.max(0, Math.floor((track.width - 4) * progress));
  ctx.fillStyle = '#6ec8ff';
  ctx.fillRect(track.x + 2, track.y + 2, fillWidth, track.height - 4);
  ctx.fillStyle = '#2f7cbe';
  ctx.fillRect(track.x + 2, track.y + Math.floor(track.height / 2), fillWidth, Math.ceil(track.height / 2) - 2);
}

function drawBasicFish(ctx: CanvasRenderingContext2D, time: number): void {
  const CARD_W = cardWidth();
  const card = { x: CARD_X, y: 122, width: CARD_W, height: 54 };
  Gfx.glassCard(ctx, card, 2);

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

function formatMeters(meters: number): string {
  if (meters >= 10) {
    return `${Math.round(meters)} m`;
  }
  if (meters >= 1) {
    return `${meters.toFixed(1)} m`;
  }
  return `${meters.toFixed(2)} m`;
}

function sizeChipLabel(width: number, height: number): string {
  const area = width * height;
  const compact = Metrics.defaultTankWidth * Metrics.defaultTankHeight;
  if (width / height > 3.2) {
    return 'WIDE';
  }
  if (height / width > 0.55) {
    return 'TALL';
  }
  if (area > compact * 1.55) {
    return 'LARGE';
  }
  if (area < compact * 0.8) {
    return 'SMALL';
  }
  return 'COMPACT';
}

function drawSize(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const card = { x: CARD_X, y: 182, width: CARD_W, height: 52 };
  Gfx.glassCard(ctx, card, 2);
  Gfx.sectionLabel(ctx, 'AQUARIUM SIZE', card.x + 12, card.y + 8);

  const widthLabel = formatMeters(Metrics.tankWidth * Metrics.metersPerPixelWidth);
  const heightLabel = formatMeters(Metrics.tankHeight * Metrics.metersPerPixelHeight);

  ctx.textBaseline = 'top';
  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.fillText(widthLabel, card.x + 12, card.y + 24);

  const widthTextWidth = ctx.measureText(widthLabel).width;
  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.fillText('wide', card.x + 16 + widthTextWidth, card.y + 27);

  const heightX = card.x + 28 + widthTextWidth + ctx.measureText('wide').width;
  ctx.font = `bold 14px ${FONT}`;
  ctx.fillStyle = Palette.ink;
  ctx.fillText(heightLabel, heightX, card.y + 24);

  const heightTextWidth = ctx.measureText(heightLabel).width;
  ctx.font = `11px ${FONT}`;
  ctx.fillStyle = Palette.inkMuted;
  ctx.fillText('tall', heightX + heightTextWidth + 6, card.y + 27);

  const chip = { x: card.x + card.width - 86, y: card.y + 22, width: 74, height: 20 };
  Gfx.fillRound(ctx, chip, 10, 'rgba(30, 80, 120, 0.8)', 'rgba(15, 50, 80, 0.8)');
  Gfx.centeredText(ctx, sizeChipLabel(Metrics.tankWidth, Metrics.tankHeight), `bold 10px ${FONT}`, 'rgba(255, 255, 255, 1)', chip);
  ctx.textBaseline = 'alphabetic';
}

function drawPlacedFish(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const card = { x: CARD_X, y: 240, width: CARD_W, height: 78 };
  Gfx.glassCard(ctx, card, 2);
  Gfx.sectionLabel(ctx, 'PLACED FISH', card.x + 12, card.y + 8);

  ctx.font = `bold 11px ${FONT}`;
  ctx.fillStyle = Palette.accent;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText('3 / 6', card.x + card.width - 12, card.y + 8);
  ctx.textAlign = 'left';

  drawSlotRow(ctx, card.y + 28, true);
}

function drawPlacedDecorations(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const card = { x: CARD_X, y: 324, width: CARD_W, height: 78 };
  Gfx.glassCard(ctx, card, 2);
  Gfx.sectionLabel(ctx, 'PLACED DECORATIONS', card.x + 12, card.y + 8);

  ctx.font = `bold 11px ${FONT}`;
  ctx.fillStyle = Palette.accent;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'right';
  ctx.fillText('0 / 6', card.x + card.width - 12, card.y + 8);
  ctx.textAlign = 'left';

  drawSlotRow(ctx, card.y + 28, false);
}

function drawSlotRow(ctx: CanvasRenderingContext2D, y: number, showFish: boolean): void {
  const CARD_W = cardWidth();
  const slotSize = 36;
  const gap = 8;
  const count = 6;
  const total = count * slotSize + (count - 1) * gap;
  const startX = CARD_X + (CARD_W - total) / 2;

  for (let i = 0; i < count; i++) {
    const slot = { x: startX + i * (slotSize + gap), y, width: slotSize, height: slotSize };
    Gfx.insetWell(ctx, slot, 8);

    if (showFish && i === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(slot.x, slot.y, slot.width, slot.height);
      ctx.clip();
      drawFish(ctx, slot.x + slot.width / 2, slot.y + slot.height / 2, true, 'rgba(255, 168, 48, 1)', 'rgba(232, 96, 40, 1)', 0, 0, 0.35, 0.8);
      ctx.restore();
    } else {
      const lockRect = {
        x: slot.x + slot.width / 2 - 7,
        y: slot.y + slot.height / 2 - 7,
        width: 14,
        height: 14,
      };
      drawLock(ctx, lockRect);
    }
  }
}

function drawDock(ctx: CanvasRenderingContext2D): void {
  const CARD_W = cardWidth();
  const dock = { x: CARD_X, y: 410, width: CARD_W, height: 42 };
  Gfx.glassCard(ctx, dock, 2);

  const iconSize = 30;
  const gap = 8;
  const totalButtons = 6;
  const totalWidth = totalButtons * iconSize + (totalButtons - 1) * gap;
  const startX = dock.x + (dock.width - totalWidth) / 2;
  const y = dock.y + (dock.height - iconSize) / 2;

  for (let i = 0; i < totalButtons; i++) {
    const iconRect = { x: startX + i * (iconSize + gap), y, width: iconSize, height: iconSize };
    const selected = i === 0;
    Gfx.pixelBevel(
      ctx,
      iconRect,
      selected ? 'rgba(142, 216, 255, 1)' : 'rgba(90, 160, 214, 1)',
      selected ? 'rgba(47, 124, 190, 1)' : 'rgba(32, 90, 150, 1)',
      selected
    );
    drawNavGlyph(ctx, iconRect, i);
  }
}
