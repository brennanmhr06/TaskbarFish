export type LogLevel = 'error' | 'warn' | 'success' | 'info' | 'debug';

export interface SavedFish {
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

export interface ElectronAPI {
  setMenuOpen: (open: boolean) => void;
  closeWindow: () => void;
  dragWindow: (payload: { screenX: number; screenY: number; start: boolean }) => void;
  log: (level: LogLevel, message: string) => void;
  loadAquarium: () => Promise<{ fish: SavedFish[] } | null>;
  saveAquarium: (state: { fish: SavedFish[] }) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
