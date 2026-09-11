import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import {
  connectMongo,
  disconnectMongo,
  loadAquariumState,
  saveAquariumState,
  SavedAquarium,
  signupUser,
  loginUser,
  findUserById,
  validateSignup,
} from './db';
import { loadSession, saveSession } from './session';
import { isLogLevel, log } from './logger';
import * as dotenv from 'dotenv';

dotenv.config();

let aquariumWindow: BrowserWindow | null = null;
let authWindow: BrowserWindow | null = null;
let currentUserId: string | null = null;

const LID_DEPTH = 18;
const DEFAULT_TANK_WIDTH = 320;
const DEFAULT_TANK_HEIGHT = 120;
const MIN_TANK_WIDTH = 300;
const MIN_TANK_HEIGHT = 80;
const MAX_TANK_WIDTH = 1200;
const MAX_TANK_HEIGHT = 420;
const MENU_HEIGHT = 460;
const AUTH_WIDTH = 400;
const AUTH_HEIGHT = 640;

let tankWidth = DEFAULT_TANK_WIDTH;
let tankHeight = DEFAULT_TANK_HEIGHT;
let menuOpen = false;

function tankFrameHeight(): number {
  return LID_DEPTH + tankHeight;
}

function clampTankSize(width: number, height: number): { width: number; height: number } {
  const { workArea } = screen.getPrimaryDisplay();
  const maxWidth = Math.min(MAX_TANK_WIDTH, workArea.width);
  const maxHeight = Math.min(MAX_TANK_HEIGHT, Math.max(MIN_TANK_HEIGHT, workArea.height - (menuOpen ? MENU_HEIGHT : 0)));
  return {
    width: Math.round(Math.min(maxWidth, Math.max(MIN_TANK_WIDTH, width))),
    height: Math.round(Math.min(maxHeight, Math.max(MIN_TANK_HEIGHT, height))),
  };
}

function applyWindowBounds(pinRight: boolean, pinBottom: boolean): void {
  if (!aquariumWindow) {
    return;
  }
  const bounds = aquariumWindow.getBounds();
  const height = tankFrameHeight() + (menuOpen ? MENU_HEIGHT : 0);
  const x = pinRight ? bounds.x + bounds.width - tankWidth : bounds.x;
  const y = pinBottom ? bounds.y + bounds.height - height : bounds.y;
  aquariumWindow.setBounds({ x, y, width: tankWidth, height });
}

function preloadPath(): string {
  return path.join(__dirname, 'preload.js');
}

function createAquariumWindow(): void {
  if (aquariumWindow) {
    aquariumWindow.focus();
    return;
  }

  log.info('Creating aquarium window');

  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + Math.floor((workArea.width - tankWidth) / 2);
  const y = workArea.y + Math.floor((workArea.height - tankFrameHeight()) / 2);

  aquariumWindow = new BrowserWindow({
    width: tankWidth,
    height: tankFrameHeight(),
    minWidth: MIN_TANK_WIDTH,
    minHeight: MIN_TANK_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  aquariumWindow.setAlwaysOnTop(true, 'screen-saver');

  const rendererPath = path.join(__dirname, 'renderer.html');
  log.info(`Loading renderer: ${rendererPath}`);
  aquariumWindow.loadFile(rendererPath).catch((err) => {
    log.error('Failed to load renderer', err);
  });

  aquariumWindow.webContents.on('did-finish-load', () => {
    log.success('Renderer loaded');
  });

  aquariumWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    log.error(`Renderer failed to load (${code}): ${description}`, url);
  });

  aquariumWindow.webContents.on('render-process-gone', (_event, details) => {
    log.error(`Renderer process gone: ${details.reason}`, details.exitCode);
  });

  aquariumWindow.webContents.on('console-message', (_event, level, message) => {
    if (level === 2) {
      log.error(`Renderer console: ${message}`);
    } else if (level === 1) {
      log.warn(`Renderer console: ${message}`);
    }
  });

  aquariumWindow.on('closed', () => {
    log.info('Window closed');
    aquariumWindow = null;
  });

  log.success(`Window created at ${x},${y} (${tankWidth}x${tankFrameHeight()})`);
}

function createAuthWindow(view: 'signup' | 'login' = 'signup'): void {
  if (authWindow) {
    authWindow.focus();
    return;
  }

  log.info(`Creating ${view} frame`);

  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + Math.floor((workArea.width - AUTH_WIDTH) / 2);
  const y = workArea.y + Math.floor((workArea.height - AUTH_HEIGHT) / 2);

  authWindow = new BrowserWindow({
    width: AUTH_WIDTH,
    height: AUTH_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  authWindow.setAlwaysOnTop(true, 'screen-saver');

  const authPath = path.join(__dirname, 'auth.html');
  authWindow.loadFile(authPath, { query: { view } }).catch((err) => {
    log.error('Failed to load auth frame', err);
  });

  authWindow.on('closed', () => {
    authWindow = null;
    if (!aquariumWindow) {
      app.quit();
    }
  });
}

async function restoreTankForUser(userId: string): Promise<void> {
  const saved = await loadAquariumState(userId);
  if (saved?.tankWidth && saved?.tankHeight) {
    const next = clampTankSize(saved.tankWidth, saved.tankHeight);
    tankWidth = next.width;
    tankHeight = next.height;
    log.info(`Restored tank size ${tankWidth}x${tankHeight}`);
  }
}

async function beginSession(user: { id: string; username: string }): Promise<void> {
  currentUserId = user.id;
  saveSession({ userId: user.id, username: user.username });
  await restoreTankForUser(user.id);
}

function openAquariumAndCloseAuth(): void {
  createAquariumWindow();
  if (authWindow) {
    const closing = authWindow;
    authWindow = null;
    closing.close();
  }
}

async function enterGame(user: { id: string; username: string }): Promise<void> {
  await beginSession(user);
  openAquariumAndCloseAuth();
}

const dragOffsets = new WeakMap<BrowserWindow, { x: number; y: number }>();

ipcMain.on('set-menu-open', (_event, open: boolean) => {
  if (open !== menuOpen) {
    log.info(open ? 'Menu opened' : 'Menu closed');
    menuOpen = open;
  }
  applyWindowBounds(false, true);
});

ipcMain.on('resize-tank', (_event, payload: { tankWidth: number; tankHeight: number; pinRight: boolean; pinBottom: boolean }) => {
  if (!payload || typeof payload.tankWidth !== 'number' || typeof payload.tankHeight !== 'number') {
    return;
  }
  const next = clampTankSize(payload.tankWidth, payload.tankHeight);
  tankWidth = next.width;
  tankHeight = next.height;
  applyWindowBounds(Boolean(payload.pinRight), Boolean(payload.pinBottom));
});

ipcMain.on('renderer-log', (_event, level: unknown, message: unknown) => {
  if (!isLogLevel(level) || typeof message !== 'string') {
    log.warn('Ignored malformed renderer log');
    return;
  }
  log[level](message);
});

ipcMain.on('drag-window', (event, payload: { screenX: number; screenY: number; start: boolean }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) {
    return;
  }
  if (payload.start) {
    const bounds = win.getBounds();
    dragOffsets.set(win, {
      x: payload.screenX - bounds.x,
      y: payload.screenY - bounds.y,
    });
    return;
  }
  const offset = dragOffsets.get(win);
  if (!offset) {
    return;
  }
  win.setPosition(Math.round(payload.screenX - offset.x), Math.round(payload.screenY - offset.y));
});

ipcMain.on('close-window', (event) => {
  log.info('Close requested');
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

ipcMain.handle('auth:signup', async (_event, payload: { username: unknown; email: unknown; password: unknown; confirm: unknown }) => {
  if (!payload || payload.password !== payload.confirm) {
    return { ok: false, error: 'Passwords do not match' };
  }
  const error = validateSignup(payload);
  if (error) {
    return { ok: false, error };
  }
  try {
    const result = await signupUser({
      username: String(payload.username),
      email: String(payload.email),
      password: String(payload.password)
    });
    if (result.ok && result.user) {
      await beginSession({ id: result.user.id, username: result.user.username });
      setTimeout(() => {
        openAquariumAndCloseAuth();
      }, 0);
    }
    return result.ok ? { ok: true } : result;
  } catch (err) {
    log.error('Signup failed', err);
    return { ok: false, error: 'Could not create account' };
  }
});

ipcMain.handle('auth:login', async (_event, payload: { identifier: unknown; password: unknown }) => {
  if (!payload || typeof payload.identifier !== 'string' || typeof payload.password !== 'string') {
    return { ok: false, error: 'Enter your username/email and password' };
  }
  try {
    const result = await loginUser({
      identifier: payload.identifier,
      password: payload.password
    });
    if (result.ok && result.user) {
      await beginSession({ id: result.user.id, username: result.user.username });
      setTimeout(() => {
        openAquariumAndCloseAuth();
      }, 0);
    }
    return result.ok ? { ok: true } : result;
  } catch (err) {
    log.error('Login failed', err);
    return { ok: false, error: 'Could not log in' };
  }
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception', err);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection', reason);
});

ipcMain.handle('aquarium:load', async () => {
  if (!currentUserId) {
    return null;
  }
  try {
    const state = await loadAquariumState(currentUserId);
    if (state) {
      log.info(`Loaded aquarium state with ${state.fish.length} fish`);
    }
    return state;
  } catch (err) {
    log.error('Failed to load aquarium state', err);
    return null;
  }
});

ipcMain.on('aquarium:save', (_event, state: SavedAquarium) => {
  if (!currentUserId || !state || !Array.isArray(state.fish)) {
    log.warn('Ignored malformed aquarium save');
    return;
  }
  saveAquariumState(currentUserId, state).catch((err) => {
    log.error('Failed to save aquarium state', err);
  });
});

app.on('ready', async () => {
  log.success('Aquarium Taskbar started');
  try {
    await connectMongo();
    const session = loadSession();
    if (session) {
      const user = await findUserById(session.userId);
      if (user) {
        log.info(`Auto-login as "${user.username}"`);
        await enterGame({ id: user.id, username: user.username });
        return;
      }
      log.warn('Saved session did not match an account');
    }
  } catch (err) {
    log.error('Failed to connect to MongoDB', err);
  }
  createAuthWindow('signup');
});

app.on('before-quit', () => {
  disconnectMongo().catch((err) => {
    log.error('Failed to disconnect from MongoDB', err);
  });
});

app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    log.info('Quitting');
    app.quit();
  }
});

app.on('activate', () => {
  if (aquariumWindow === null && authWindow === null) {
    if (currentUserId) {
      log.info('App activated; recreating aquarium');
      createAquariumWindow();
    } else {
      log.info('App activated; recreating sign up frame');
      createAuthWindow('signup');
    }
  }
});
