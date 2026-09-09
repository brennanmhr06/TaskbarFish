import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import { connectMongo, disconnectMongo, loadAquariumState, saveAquariumState, SavedAquarium } from './db';
import { isLogLevel, log } from './logger';
import * as dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | null = null;

const TANK_WIDTH = 320;
const TANK_FRAME_HEIGHT = 138;
const MENU_HEIGHT = 460;

function createWindow(): void {
  log.info('Creating aquarium window');

  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + Math.floor((workArea.width - TANK_WIDTH) / 2);
  const y = workArea.y + Math.floor((workArea.height - TANK_FRAME_HEIGHT) / 2);

  mainWindow = new BrowserWindow({
    width: TANK_WIDTH,
    height: TANK_FRAME_HEIGHT,
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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  const rendererPath = path.join(__dirname, 'renderer.html');
  log.info(`Loading renderer: ${rendererPath}`);
  mainWindow.loadFile(rendererPath).catch((err) => {
    log.error('Failed to load renderer', err);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log.success('Renderer loaded');
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    log.error(`Renderer failed to load (${code}): ${description}`, url);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log.error(`Renderer process gone: ${details.reason}`, details.exitCode);
  });

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    if (level === 2) {
      log.error(`Renderer console: ${message}`);
    } else if (level === 1) {
      log.warn(`Renderer console: ${message}`);
    }
  });

  mainWindow.on('closed', () => {
    log.info('Window closed');
    mainWindow = null;
  });

  log.success(`Window created at ${x},${y} (${TANK_WIDTH}x${TANK_FRAME_HEIGHT})`);
}

let dragOffsetX = 0;
let dragOffsetY = 0;
let menuOpen = false;

function setWindowHeight(height: number): void {
  if (!mainWindow) {
    return;
  }
  const bounds = mainWindow.getBounds();
  mainWindow.setBounds({
    x: bounds.x,
    y: bounds.y + bounds.height - height,
    width: TANK_WIDTH,
    height,
  });
}

ipcMain.on('set-menu-open', (_event, open: boolean) => {
  if (open !== menuOpen) {
    log.info(open ? 'Menu opened' : 'Menu closed');
    menuOpen = open;
  }
  setWindowHeight(TANK_FRAME_HEIGHT + (open ? MENU_HEIGHT : 0));
});

ipcMain.on('renderer-log', (_event, level: unknown, message: unknown) => {
  if (!isLogLevel(level) || typeof message !== 'string') {
    log.warn('Ignored malformed renderer log');
    return;
  }
  log[level](message);
});

ipcMain.on('drag-window', (_event, payload: { screenX: number; screenY: number; start: boolean }) => {
  if (!mainWindow) {
    return;
  }
  if (payload.start) {
    const bounds = mainWindow.getBounds();
    dragOffsetX = payload.screenX - bounds.x;
    dragOffsetY = payload.screenY - bounds.y;
    return;
  }
  mainWindow.setPosition(Math.round(payload.screenX - dragOffsetX), Math.round(payload.screenY - dragOffsetY));
});

ipcMain.on('close-window', () => {
  log.info('Close requested');
  mainWindow?.close();
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception', err);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection', reason);
});

ipcMain.handle('aquarium:load', async () => {
  try {
    const state = await loadAquariumState();
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
  if (!state || !Array.isArray(state.fish)) {
    log.warn('Ignored malformed aquarium save');
    return;
  }
  saveAquariumState(state).catch((err) => {
    log.error('Failed to save aquarium state', err);
  });
});

app.on('ready', async () => {
  log.success('Aquarium Taskbar started');
  try {
    await connectMongo();
  } catch (err) {
    log.error('Failed to connect to MongoDB', err);
  }
  createWindow();
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
  if (mainWindow === null) {
    log.info('App activated; recreating window');
    createWindow();
  }
});
