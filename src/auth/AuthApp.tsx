import React, { FormEvent, useMemo, useState } from 'react';
import { PixelTankBanner } from './PixelTankBanner';
import { log } from '../renderer/log';

type AuthView = 'signup' | 'login';

function initialView(): AuthView {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'login' ? 'login' : 'signup';
}

const AuthApp: React.FC = () => {
  const [view, setView] = useState<AuthView>(initialView);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => (view === 'signup' ? 'NEW TANK' : 'RETURN'), [view]);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, input, a')) {
      return;
    }
    window.electron?.dragWindow({ screenX: e.screenX, screenY: e.screenY, start: true });
    const move = (ev: PointerEvent) => {
      window.electron?.dragWindow({ screenX: ev.screenX, screenY: ev.screenY, start: false });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const submitSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await window.electron?.signup({ username, email, password, confirm });
      if (!result?.ok) {
        setError(result?.error || 'Could not create account');
      }
    } catch (err) {
      log.error(`Signup failed: ${String(err)}`);
      setError('Could not create account');
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await window.electron?.login({ identifier, password });
      if (!result?.ok) {
        setError(result?.error || 'Could not log in');
      }
    } catch (err) {
      log.error(`Login failed: ${String(err)}`);
      setError('Could not log in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="pixel-frame">
        <header className="pixel-titlebar" onPointerDown={handlePointerDown}>
          <span className="pixel-title">AQUARIUM TASKBAR</span>
          <button className="pixel-x" type="button" onClick={() => window.electron?.closeWindow()} aria-label="Close">
            X
          </button>
        </header>
        <PixelTankBanner />
        <div className="pixel-body">
          <h1 className="pixel-heading">{title}</h1>
          <p className="pixel-sub">
            {view === 'signup' ? 'CREATE YOUR FISH ACCOUNT' : 'LOAD YOUR SAVED TANK'}
          </p>

          {view === 'signup' ? (
            <form className="pixel-form" onSubmit={submitSignup}>
              <label>
                USERNAME
                <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" maxLength={20} required />
              </label>
              <label>
                EMAIL
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" maxLength={80} required />
              </label>
              <label>
                PASSWORD
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" minLength={8} required />
              </label>
              <label>
                CONFIRM
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" autoComplete="new-password" minLength={8} required />
              </label>
              {error ? <div className="pixel-error">{error}</div> : null}
              <button className="pixel-btn" type="submit" disabled={busy}>
                {busy ? 'SAVING...' : 'SIGN UP'}
              </button>
              <button
                className="pixel-link"
                type="button"
                onClick={() => {
                  setError('');
                  setView('login');
                }}
              >
                HAVE AN ACCOUNT? LOGIN
              </button>
            </form>
          ) : (
            <form className="pixel-form" onSubmit={submitLogin}>
              <label>
                USERNAME / EMAIL
                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
              </label>
              <label>
                PASSWORD
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required />
              </label>
              {error ? <div className="pixel-error">{error}</div> : null}
              <button className="pixel-btn" type="submit" disabled={busy}>
                {busy ? 'LOADING...' : 'LOGIN'}
              </button>
              <button
                className="pixel-link"
                type="button"
                onClick={() => {
                  setError('');
                  setView('signup');
                }}
              >
                NEW HERE? SIGN UP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthApp;
