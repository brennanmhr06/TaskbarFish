import React, { useEffect, useRef, useState } from 'react';
import { createAquarium, resetAquarium, tickAquarium, containAquarium, Aquarium } from '../scene/Aquarium';
import { drawTankRenderer } from '../rendering/TankRenderer';
import { drawMenuRenderer, drawToggleButton } from '../rendering/MenuRenderer';
import { Metrics } from '../drawing/Metrics';
import { log } from './log';
import { createFish } from '../entities/Fish';

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

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

function resizeCursor(edge: ResizeEdge | null): string {
  switch (edge) {
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
    default:
      return 'default';
  }
}

function hitResizeEdge(x: number, y: number, menuOpen: boolean): ResizeEdge | null {
  const tank = Metrics.tankBounds(menuOpen ? Metrics.menuHeight : 0);
  const pad = Metrics.resizeHandle;
  if (!hitRect(x, y, tank, 2)) {
    return null;
  }

  const onLeft = x <= tank.x + pad;
  const onRight = x >= tank.x + tank.width - pad;
  const onTop = y <= tank.y + pad;
  const onBottom = y >= tank.y + tank.height - pad;

  if (menuOpen && onTop) {
    if (onLeft) {
      return 'w';
    }
    if (onRight) {
      return 'e';
    }
    return null;
  }

  if (onTop && onLeft) {
    return 'nw';
  }
  if (onTop && onRight) {
    return 'ne';
  }
  if (onBottom && onLeft) {
    return 'sw';
  }
  if (onBottom && onRight) {
    return 'se';
  }
  if (onTop) {
    return 'n';
  }
  if (onBottom) {
    return 's';
  }
  if (onLeft) {
    return 'w';
  }
  if (onRight) {
    return 'e';
  }
  return null;
}

function saveAquariumState(aquarium: Aquarium): void {
  window.electron?.saveAquarium({
    fish: aquarium.fish,
    tankWidth: Metrics.tankWidth,
    tankHeight: Metrics.tankHeight,
    totalXP: aquarium.totalXP,
  });
}

function applyTankSize(width: number, height: number, pinRight: boolean, pinBottom: boolean, aquarium: Aquarium | null): void {
  Metrics.setTankSize(width, height);
  if (aquarium) {
    containAquarium(aquarium);
  }
  window.electron?.resizeTank({
    tankWidth: Metrics.tankWidth,
    tankHeight: Metrics.tankHeight,
    pinRight,
    pinBottom,
  });
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
  const [cursor, setCursor] = useState('default');
  const menuOpenRef = useRef(false);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const resizingRef = useRef<{
    edge: ResizeEdge;
    startScreenX: number;
    startScreenY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    const aquarium = aquariumRef.current;
    log.success(
      `Aquarium initialized with ${aquarium?.fish.length ?? 0} fish and ${aquarium?.algae.length ?? 0} algae`
    );
    log.success('Game loop started - Fish will chase and eat algae to gain XP!');

    let cancelled = false;
    window.electron
      ?.loadAquarium()
      .then((state) => {
        if (cancelled || !aquariumRef.current) {
          return;
        }
        if (state?.fish?.length) {
          // Merge saved fish data with new fish properties
          const currentTime = Date.now();
          aquariumRef.current.fish = state.fish.map((savedFish) => {
            const fish = createFish(
              savedFish.x, 
              savedFish.y, 
              savedFish.speed, 
              savedFish.facingRight,
              savedFish.body, 
              savedFish.fin, 
              savedFish.bob, 
              savedFish.bobSpeed, 
              savedFish.phase,
              savedFish.maxAlgae ?? 3,
              savedFish.fullDuration ?? 180000
            );
            
            // Apply saved hunger state
            fish.hunger = savedFish.hunger ?? 0;
            fish.lastEatenTime = savedFish.lastEatenTime ?? 0;
            
            // Reset hunger if fish was full and enough time has passed
            if (fish.hunger >= fish.maxAlgae && 
                fish.lastEatenTime && 
                (currentTime - fish.lastEatenTime >= fish.fullDuration)) {
              fish.hunger = 0;
            }
            
            return fish;
          });
          log.success(`Loaded ${state.fish.length} fish from MongoDB`);
        }
        
        // Load total XP
        if (state?.totalXP !== undefined) {
          aquariumRef.current.totalXP = state.totalXP;
          log.success(`Loaded total XP: ${state.totalXP}`);
        } else {
          // If no saved XP, keep the default
          log.success('No saved XP found, using defaults');
        }
        if (state?.tankWidth && state?.tankHeight) {
          applyTankSize(state.tankWidth, state.tankHeight, false, true, aquariumRef.current);
          log.success(`Loaded tank size ${Metrics.tankWidth}x${Metrics.tankHeight}`);
        }
      })
      .catch((err) => {
        log.error(`Failed to load aquarium from MongoDB: ${String(err)}`);
      });

    const save = () => {
      const current = aquariumRef.current;
      if (!current) {
        return;
      }
      saveAquariumState(current);
    };

    const interval = window.setInterval(save, 5000);

    // Start background music
    const backgroundMusic = document.getElementById('background-music') as HTMLAudioElement;
    if (backgroundMusic) {
      backgroundMusic.volume = 0.3; // Set volume to 30% for nice ambient level
      backgroundMusic.play().catch((err) => {
        log.warn(`Could not play background music: ${String(err)}`);
      });
    }

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      save();
      
      // Stop background music when component unmounts
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    menuOpenRef.current = topMenuOpen;
    window.electron?.setMenuOpen(topMenuOpen);
  }, [topMenuOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      log.error('Failed to get 2D canvas context');
      return;
    }

    lastTimeRef.current = 0;

    const syncCanvasSize = () => {
      const height = menuOpenRef.current ? Metrics.totalHeight : Metrics.tankFrameHeight;
      if (canvas.width !== Metrics.tankWidth || canvas.height !== height) {
        canvas.width = Metrics.tankWidth;
        canvas.height = height;
        const root = document.getElementById('root');
        if (root) {
          root.style.width = `${Metrics.tankWidth}px`;
          root.style.height = `${height}px`;
        }
      }
      return height;
    };

    syncCanvasSize();

    const animate = (now: number) => {
      const aquarium = aquariumRef.current;
      if (!aquarium) return;

      syncCanvasSize();

      const dt = lastTimeRef.current === 0 ? 0.016 : Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;
      tickAquarium(aquarium, dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const menuOffset = menuOpenRef.current ? Metrics.menuHeight : 0;
      drawTankRenderer(ctx, menuOffset, aquarium);

      if (menuOpenRef.current) {
        drawMenuRenderer(ctx, aquarium.time, aquarium.totalXP);
      }

      drawToggleButton(ctx, menuOffset, menuOpenRef.current);

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
      resizingRef.current = null;
      setTopMenuOpen((open) => !open);
      return;
    }

    if (menuOpen && hitRect(x, y, Metrics.closeButtonRect(), 4)) {
      draggingRef.current = false;
      resizingRef.current = null;
      window.electron?.closeWindow();
      return;
    }

    const edge = hitResizeEdge(x, y, menuOpen);
    if (edge) {
      draggingRef.current = false;
      resizingRef.current = {
        edge,
        startScreenX: e.screenX,
        startScreenY: e.screenY,
        startWidth: Metrics.tankWidth,
        startHeight: Metrics.tankHeight,
      };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    draggingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    window.electron?.dragWindow({ screenX: e.screenX, screenY: e.screenY, start: true });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = resizingRef.current;
    if (resize) {
      const dx = e.screenX - resize.startScreenX;
      const dy = e.screenY - resize.startScreenY;
      const fromLeft = resize.edge.includes('w');
      const fromRight = resize.edge.includes('e');
      const fromTop = resize.edge.includes('n');
      const fromBottom = resize.edge.includes('s');
      const nextWidth = resize.startWidth + (fromRight ? dx : fromLeft ? -dx : 0);
      const nextHeight = resize.startHeight + (fromBottom ? dy : fromTop ? -dy : 0);
      applyTankSize(nextWidth, nextHeight, fromLeft, fromTop, aquariumRef.current);
      setCursor(resizeCursor(resize.edge));
      return;
    }

    if (draggingRef.current) {
      window.electron?.dragWindow({ screenX: e.screenX, screenY: e.screenY, start: false });
      return;
    }

    const { x, y } = canvasPoint(canvas, e.clientX, e.clientY);
    const menuOpen = menuOpenRef.current;
    const menuOffset = menuOpen ? Metrics.menuHeight : 0;
    if (hitRect(x, y, Metrics.buttonBounds(menuOffset), 4)) {
      setCursor('pointer');
      return;
    }
    setCursor(resizeCursor(hitResizeEdge(x, y, menuOpen)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasResizing = Boolean(resizingRef.current);
    draggingRef.current = false;
    resizingRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (wasResizing && aquariumRef.current) {
      saveAquariumState(aquariumRef.current);
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
        cursor: cursor,
      }}
    />
  );
};

export default GameWindow;
