import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  setMenuOpen: (open: boolean) => {
    ipcRenderer.send('set-menu-open', open);
  },
  closeWindow: () => {
    ipcRenderer.send('close-window');
  },
  dragWindow: (payload: { screenX: number; screenY: number; start: boolean }) => {
    ipcRenderer.send('drag-window', payload);
  },
  resizeTank: (payload: {
    tankWidth: number;
    tankHeight: number;
    pinRight: boolean;
    pinBottom: boolean;
  }) => {
    ipcRenderer.send('resize-tank', payload);
  },
  log: (level: string, message: string) => {
    ipcRenderer.send('renderer-log', level, message);
  },
  loadAquarium: () => ipcRenderer.invoke('aquarium:load'),
  saveAquarium: (state: { fish: unknown[]; tankWidth: number; tankHeight: number }) => {
    ipcRenderer.send('aquarium:save', state);
  },
  signup: (payload: { username: string; email: string; password: string; confirm: string }) => {
    return ipcRenderer.invoke('auth:signup', payload);
  },
  login: (payload: { identifier: string; password: string }) => {
    return ipcRenderer.invoke('auth:login', payload);
  },
});
