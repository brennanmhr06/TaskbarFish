import React, { useEffect, useRef, useState } from 'react';
import { createAquarium, resetAquarium, tickAquarium, Aquarium } from '../scene/Aquarium';
import { drawTankRenderer } from '../rendering/TankRenderer';
import { drawMenuRenderer, drawToggleButton } from '../rendering/MenuRenderer';
import { Metrics } from '../drawing/Metrics';
import { log } from './log';

function hitRect(
  x: number,
  y: number,
  rect: { x: number; y: number; width: number; height: number },
  pad = 0
): boolean {
  return (
    x >= rect.x - pad &&
    x <= rect.x + rect.width + pad &&
    y >= rect.y - pad &&
    y <= rect.y + rect.height + pad
  );
}

function canvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(rect.width, 1);
  const scaleY = canvas.height / Math.max(rect.height, 1);
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

const GameWindow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aquariumRef = useRef<Aquarium | null>(null);
  if (!aquariumRef.current) {
    const aq = createAquarium();
    resetAquarium(aq);
    aquariumRef.current = aq;
  }
  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const menuOpenRef = useRef(false);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    const aquarium = aquariumRef.current;
    log.success(
      `Aquarium initialized with ${aquarium?.fish.length ?? 0} fish and ${aquarium?.bubbles.length ?? 0} bubbles`
    );
    log.success('Game loop started');

    let cancelled = false;
    window.electron
      ?.loadAquarium()
      .then((state) => {
        if (cancelled || !state?.fish?.length || !aquariumRef.current) {
          return;
        }
        aquariumRef.current.fish = state.fish;
        log.success(`Loaded ${state.fish.length} fish from MongoDB`);
      })
      .catch((err) => {
        log.error(`Failed to load aquarium from MongoDB: ${String(err)}`);
      });

    const save = () => {
      const current = aquariumRef.current;
      if (!current) {
        return;
      }
      window.electron?.saveAquarium({ fish: current.fish });
    };

    const interval = window.setInterval(save, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      save();
    };
  }, []);

  useEffect(() => {
    menuOpenRef.current = topMenuOpen;
    window.electron?.setMenuOpen(topMenuOpen);
  }, [topMenuOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const height = Metrics.tankFrameHeight + (topMenuOpen ? Metrics.menuHeight : 0);
    canvas.width = Metrics.tankWidth;
    canvas.height = height;

    const root = document.getElementById('root');
    if (root) {
      root.style.width = `${Metrics.tankWidth}px`;
      root.style.height = `${height}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      log.error('Failed to get 2D canvas context');
      return;
    }

    lastTimeRef.current = 0;

    const animate = (now: number) => {
      const aquarium = aquariumRef.current;
      if (!aquarium) return;

      const dt = lastTimeRef.current === 0 ? 0.016 : Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      tickAquarium(aquarium, dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const menuOffset = topMenuOpen ? Metrics.menuHeight : 0;
      drawTankRenderer(ctx, menuOffset, aquarium);

      if (topMenuOpen) {
        drawMenuRenderer(ctx, aquarium.time);
      }

      drawToggleButton(ctx, menuOffset, topMenuOpen);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [topMenuOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = canvasPoint(canvas, e.clientX, e.clientY);
    const menuOpen = menuOpenRef.current;
    const menuOffset = menuOpen ? Metrics.menuHeight : 0;
    const buttonBounds = Metrics.buttonBounds(menuOffset);

    if (hitRect(x, y, buttonBounds, 4)) {
      draggingRef.current = false;
      setTopMenuOpen((open) => !open);
      return;
    }

    if (menuOpen && hitRect(x, y, Metrics.closeButtonRect(), 4)) {
      draggingRef.current = false;
      window.electron?.closeWindow();
      return;
    }

    draggingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    window.electron?.dragWindow({ screenX: e.screenX, screenY: e.screenY, start: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    window.electron?.dragWindow({ screenX: e.screenX, screenY: e.screenY, start: false });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        display: 'block',
      }}
    />
  );
};

export default GameWindow;
