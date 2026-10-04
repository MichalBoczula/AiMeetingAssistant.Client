import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';

export type ScreenWakeLockState =
  'inactive' | 'requesting' | 'active' | 'unavailable' | 'unsupported';

@Injectable({ providedIn: 'root' })
export class ScreenWakeLockService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly currentState = signal<ScreenWakeLockState>('inactive');
  private sentinel: WakeLockSentinel | null = null;
  private enabled = false;
  private generation = 0;
  private pendingGeneration: number | null = null;

  readonly state = this.currentState.asReadonly();

  constructor() {
    const onVisibilityChange = () => {
      if (this.document.visibilityState === 'visible') {
        void this.acquire();
      } else {
        this.suspend();
      }
    };
    const onPageHide = () => this.suspend();
    const onPageShow = () => void this.acquire();

    this.document.addEventListener('visibilitychange', onVisibilityChange);
    this.window?.addEventListener('pagehide', onPageHide);
    this.window?.addEventListener('pageshow', onPageShow);
    inject(DestroyRef).onDestroy(() => {
      this.stop();
      this.document.removeEventListener('visibilitychange', onVisibilityChange);
      this.window?.removeEventListener('pagehide', onPageHide);
      this.window?.removeEventListener('pageshow', onPageShow);
    });
  }

  start(): void {
    this.enabled = true;
    void this.acquire();
  }

  stop(): void {
    this.enabled = false;
    this.suspend();
  }

  private async acquire(): Promise<void> {
    if (!this.enabled || this.document.visibilityState !== 'visible') {
      return;
    }

    const navigator = this.window?.navigator;
    if (!navigator?.wakeLock || this.window?.isSecureContext === false) {
      this.currentState.set('unsupported');
      return;
    }

    if (this.pendingGeneration !== null || (this.sentinel && !this.sentinel.released)) {
      return;
    }

    const generation = this.generation;
    this.pendingGeneration = generation;
    this.currentState.set('requesting');

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      if (
        generation !== this.generation ||
        !this.enabled ||
        this.document.visibilityState !== 'visible'
      ) {
        this.release(sentinel);
        return;
      }

      this.sentinel = sentinel;
      this.currentState.set(sentinel.released ? 'unavailable' : 'active');
      sentinel.addEventListener(
        'release',
        () => {
          if (this.sentinel === sentinel) {
            this.sentinel = null;
            this.currentState.set('unavailable');
          }
        },
        { once: true },
      );
    } catch {
      if (generation === this.generation && this.enabled) {
        this.currentState.set('unavailable');
      }
    } finally {
      if (this.pendingGeneration === generation) {
        this.pendingGeneration = null;
      }
    }
  }

  private suspend(): void {
    this.generation++;
    this.pendingGeneration = null;
    const sentinel = this.sentinel;
    this.sentinel = null;
    this.currentState.set('inactive');
    if (sentinel) {
      this.release(sentinel);
    }
  }

  private release(sentinel: WakeLockSentinel): void {
    void sentinel.release().catch(() => undefined);
  }
}
