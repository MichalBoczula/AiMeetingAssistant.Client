import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { AiAnalysisCompleted } from './ai-analysis-completed';
import { SignalRAiAnalysisService } from './signalr-ai-analysis.service';
import { SIGNALR_HUB_CONNECTION, SignalRHubConnection } from './signalr-hub-connection';

describe('SignalRAiAnalysisService', () => {
  it('updates the text when SignalR publishes an AI analysis', () => {
    let handler: ((notification: AiAnalysisCompleted) => void) | undefined;

    const connection: SignalRHubConnection = {
      on: vi.fn((_eventName, callback) => {
        handler = callback;
      }),
      start: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      providers: [{ provide: SIGNALR_HUB_CONNECTION, useValue: connection }]
    });

    const service = TestBed.inject(SignalRAiAnalysisService);

    handler?.({ text: 'Discuss the release timeline before Friday.' });

    expect(service.analysisText()).toBe('Discuss the release timeline before Friday.');
    expect(connection.on).toHaveBeenCalledWith('AiAnalysisCompleted', expect.any(Function));
    expect(connection.start).toHaveBeenCalledOnce();
  });
});
