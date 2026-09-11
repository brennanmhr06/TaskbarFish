export type LogLevel = 'error' | 'warn' | 'success' | 'info' | 'debug';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const LEVEL_COLOR: Record<LogLevel, string> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  success: '\x1b[32m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
};

const LEVEL_STREAM: Record<LogLevel, NodeJS.WriteStream> = {
  error: process.stderr,
  warn: process.stderr,
  success: process.stdout,
  info: process.stdout,
  debug: process.stdout,
};

function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function formatValue(value: unknown): string {
  if (value instanceof Error) {
    return value.stack || value.message;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function write(level: LogLevel, message: string, extra?: unknown): void {
  const color = LEVEL_COLOR[level];
  const tag = `[${level.toUpperCase()}]`;
  const extraText = extra === undefined ? '' : ` ${formatValue(extra)}`;
  const line = `${color}${BOLD}${tag}${RESET} ${color}${message}${extraText}${RESET}\n`;
  LEVEL_STREAM[level].write(`${'\x1b[90m'}${timestamp()}${RESET} ${line}`);
}

export const log = {
  error(message: string, extra?: unknown): void {
    write('error', message, extra);
  },
  warn(message: string, extra?: unknown): void {
    write('warn', message, extra);
  },
  success(message: string, extra?: unknown): void {
    write('success', message, extra);
  },
  info(message: string, extra?: unknown): void {
    write('info', message, extra);
  },
  debug(message: string, extra?: unknown): void {
    write('debug', message, extra);
  }
};

export function isLogLevel(value: unknown): value is LogLevel {
  return (
    value === 'error' ||
    value === 'warn' ||
    value === 'success' ||
    value === 'info' ||
    value === 'debug'
  );
}
