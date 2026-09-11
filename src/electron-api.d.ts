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
  animPhase: number;
  hunger?: number;
  maxAlgae?: number;
  lastEatenTime?: number;
  fullDuration?: number;
  targetAlgae?: number | null;
}

export interface AuthResponse {
  ok: boolean;
  error?: string;
}

export interface ElectronAPI {
  setMenuOpen: (open: boolean) => void;
  closeWindow: () => void;
  dragWindow: (payload: { screenX: number; screenY: number; start: boolean }) => void;
  resizeTank: (payload: {
    tankWidth: number;
    tankHeight: number;
    pinRight: boolean;
    pinBottom: boolean;
  }) => void;
  log: (level: LogLevel, message: string) => void;
  loadAquarium: () => Promise<{ fish: SavedFish[]; tankWidth?: number; tankHeight?: number; totalXP?: number } | null>;
  saveAquarium: (state: { fish: SavedFish[]; tankWidth: number; tankHeight: number; totalXP: number }) => void;
  signup: (payload: {
    username: string;
    email: string;
    password: string;
    confirm: string;
  }) => Promise<AuthResponse>;
  login: (payload: { identifier: string; password: string }) => Promise<AuthResponse>;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
