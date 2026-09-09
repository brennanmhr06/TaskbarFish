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
  log: (level: string, message: string) => {
    ipcRenderer.send('renderer-log', level, message);
  },
  loadAquarium: () => ipcRenderer.invoke('aquarium:load'),
  saveAquarium: (state: { fish: unknown[] }) => {
    ipcRenderer.send('aquarium:save', state);
  },
});
