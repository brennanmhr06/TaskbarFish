import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { log } from './logger';

export interface SavedSession {
  userId: string;
  username: string;
}

function sessionPath(): string {
  return path.join(app.getPath('userData'), 'session.json');
}

export function loadSession(): SavedSession | null {
  try {
    const raw = fs.readFileSync(sessionPath(), 'utf8');
    const parsed = JSON.parse(raw) as SavedSession;
    if (!parsed?.userId || !parsed?.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: SavedSession): void {
  try {
    fs.writeFileSync(sessionPath(), JSON.stringify(session), 'utf8');
  } catch (err) {
    log.error('Failed to save session', err);
  }
}

export function clearSession(): void {
  try {
    fs.unlinkSync(sessionPath());
  } catch {
    // already gone
  }
}
