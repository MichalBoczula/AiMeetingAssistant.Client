import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { App } from './app';
import { SignalRAiAnalysisService } from './core/realtime/signalr-ai-analysis.service';

describe('App', () => {
  it('displays the current AI analysis in the centre of the page', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: SignalRAiAnalysisService,
          useValue: { analysisText: signal('Action item: prepare the demo.') }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).querySelector('.analysis-text')?.textContent;

    expect(text).toContain('Action item: prepare the demo.');
  });
});
