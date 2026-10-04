import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScreenWakeLockService } from './screen-wake-lock.service';

class FakeSentinel extends EventTarget {
  released = false;
  readonly release = vi.fn(async () => {
    this.released = true;
    this.dispatchEvent(new Event('release'));
  });
}

describe('ScreenWakeLockService', () => {
  let documentEvents: EventTarget;
  let windowEvents: EventTarget;
  let visibility: DocumentVisibilityState;
  let request: ReturnType<typeof vi.fn>;
  let sentinel: FakeSentinel;
  let service: ScreenWakeLockService;

  beforeEach(() => {
    visibility = 'visible';
    documentEvents = new EventTarget();
    windowEvents = new EventTarget();
    sentinel = new FakeSentinel();
    request = vi.fn().mockResolvedValue(sentinel);
    Object.defineProperties(windowEvents, {
      navigator: { value: { wakeLock: { request } }, configurable: true },
      isSecureContext: { value: true, configurable: true },
    });
    Object.defineProperties(documentEvents, {
      defaultView: { value: windowEvents },
      visibilityState: { get: () => visibility },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: documentEvents }],
    });
    service = TestBed.inject(ScreenWakeLockService);
  });

  afterEach(() => TestBed.resetTestingModule());

  async function settle(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
  }

  function setVisibility(value: DocumentVisibilityState): void {
    visibility = value;
    documentEvents.dispatchEvent(new Event('visibilitychange'));
  }

  it('acquires a screen lock and avoids duplicate requests while pending or active', async () => {
    service.start();
    service.start();
    expect(service.state()).toBe('requesting');
    await settle();
    service.start();
    expect(request).toHaveBeenCalledExactlyOnceWith('screen');
    expect(service.state()).toBe('active');
  });

  it('waits until the page is visible before requesting a lock', async () => {
    visibility = 'hidden';
    service.start();
    expect(request).not.toHaveBeenCalled();
    setVisibility('visible');
    await settle();
    expect(service.state()).toBe('active');
  });

  it('releases when hidden and acquires a new lock after returning', async () => {
    const nextSentinel = new FakeSentinel();
    request.mockResolvedValueOnce(sentinel).mockResolvedValueOnce(nextSentinel);
    service.start();
    await settle();
    setVisibility('hidden');
    expect(sentinel.release).toHaveBeenCalledOnce();
    expect(service.state()).toBe('inactive');
    setVisibility('visible');
    await settle();
    expect(request).toHaveBeenCalledTimes(2);
    expect(service.state()).toBe('active');
  });

  it('handles page hide and restore without requiring a visibility event', async () => {
    request.mockResolvedValueOnce(sentinel).mockResolvedValueOnce(new FakeSentinel());
    service.start();
    await settle();
    windowEvents.dispatchEvent(new Event('pagehide'));
    expect(sentinel.release).toHaveBeenCalledOnce();
    windowEvents.dispatchEvent(new Event('pageshow'));
    await settle();
    expect(request).toHaveBeenCalledTimes(2);
    expect(service.state()).toBe('active');
  });

  it('allows explicit retry after rejection without an automatic retry loop', async () => {
    request.mockRejectedValueOnce(new Error('Battery saver'));
    service.start();
    await settle();
    expect(service.state()).toBe('unavailable');
    expect(request).toHaveBeenCalledOnce();
    service.start();
    await settle();
    expect(service.state()).toBe('active');
  });

  it('reports a platform release and permits a new request', async () => {
    request.mockResolvedValueOnce(sentinel).mockResolvedValueOnce(new FakeSentinel());
    service.start();
    await settle();
    await sentinel.release();
    expect(service.state()).toBe('unavailable');
    expect(request).toHaveBeenCalledOnce();
    service.start();
    await settle();
    expect(service.state()).toBe('active');
  });

  it('reports unsupported browsers and insecure contexts without requesting a lock', () => {
    Object.defineProperty(windowEvents, 'navigator', { value: {} });
    service.start();
    expect(service.state()).toBe('unsupported');
    Object.defineProperty(windowEvents, 'navigator', { value: { wakeLock: { request } } });
    Object.defineProperty(windowEvents, 'isSecureContext', { value: false });
    service.start();
    expect(service.state()).toBe('unsupported');
    expect(request).not.toHaveBeenCalled();
  });

  it('releases a late grant after hiding without replacing the new active lock', async () => {
    let resolveFirst!: (value: FakeSentinel) => void;
    request
      .mockReturnValueOnce(
        new Promise<FakeSentinel>((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce(new FakeSentinel());
    service.start();
    setVisibility('hidden');
    setVisibility('visible');
    await settle();
    expect(service.state()).toBe('active');
    resolveFirst(sentinel);
    await settle();
    expect(sentinel.release).toHaveBeenCalledOnce();
    expect(service.state()).toBe('active');
  });

  it('releases a grant that arrives after stopping and does not restart on visibility', async () => {
    let resolve!: (value: FakeSentinel) => void;
    request.mockReturnValueOnce(
      new Promise<FakeSentinel>((done) => {
        resolve = done;
      }),
    );
    service.start();
    service.stop();
    resolve(sentinel);
    await settle();
    setVisibility('visible');
    expect(sentinel.release).toHaveBeenCalledOnce();
    expect(service.state()).toBe('inactive');
    expect(request).toHaveBeenCalledOnce();
  });

  it('releases the active lock and removes event listeners on destruction', async () => {
    service.start();
    await settle();
    TestBed.resetTestingModule();
    expect(sentinel.release).toHaveBeenCalledOnce();
    setVisibility('hidden');
    setVisibility('visible');
    windowEvents.dispatchEvent(new Event('pageshow'));
    expect(request).toHaveBeenCalledOnce();
  });
});
