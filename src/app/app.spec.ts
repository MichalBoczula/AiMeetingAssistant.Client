import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { App } from './app';
import {
  ScreenWakeLockService,
  ScreenWakeLockState,
} from './core/display/screen-wake-lock.service';
import { SignalRAiAnalysisService } from './core/realtime/signalr-ai-analysis.service';

describe('App', () => {
  it('displays the current AI analysis in the centre of the page', async () => {
    const wakeLock = {
      start: vi.fn(),
      stop: vi.fn(),
      state: signal<ScreenWakeLockState>('active'),
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: ScreenWakeLockService, useValue: wakeLock },
        {
          provide: SignalRAiAnalysisService,
          useValue: { analysisText: signal('Action item: prepare the demo.') },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).querySelector(
      '.analysis-text',
    )?.textContent;

    expect(text).toContain('Action item: prepare the demo.');
    expect(wakeLock.start).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('.wake-lock-notice')).toBeNull();
    wakeLock.state.set('unavailable');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.analysis-text').textContent).toContain(
      'Action item: prepare the demo.',
    );
    (fixture.nativeElement.querySelector('.wake-lock-notice button') as HTMLButtonElement).click();
    expect(wakeLock.start).toHaveBeenCalledTimes(2);
    fixture.destroy();
    expect(wakeLock.stop).toHaveBeenCalledOnce();
  });
});
