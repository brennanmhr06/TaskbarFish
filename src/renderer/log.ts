export const log = {
  error(message: string): void {
    window.electron?.log('error', message);
  },
  warn(message: string): void {
    window.electron?.log('warn', message);
  },
  success(message: string): void {
    window.electron?.log('success', message);
  },
  info(message: string): void {
    window.electron?.log('info', message);
  },
  debug(message: string): void {
    window.electron?.log('debug', message);
  },
};
