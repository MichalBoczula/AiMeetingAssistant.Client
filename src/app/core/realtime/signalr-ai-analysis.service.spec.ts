import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { SignalRAiAnalysisService } from './signalr-ai-analysis.service';
import { SIGNALR_HUB_CONNECTION, SignalRHubConnection } from './signalr-hub-connection';

describe('SignalRAiAnalysisService', () => {
  it('updates the text when SignalR publishes an AI analysis', () => {
    const on = vi.fn();

    const connection: SignalRHubConnection = {
      on,
      start: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: SIGNALR_HUB_CONNECTION, useValue: connection }],
    });

    const service = TestBed.inject(SignalRAiAnalysisService);

    const handler = on.mock.calls.find(([eventName]) => eventName === 'AiAnalysisCompleted')?.[1];
    expect(handler).toBeDefined();
    handler({ text: 'Discuss the release timeline before Friday.' });

    expect(service.analysisText()).toBe('Discuss the release timeline before Friday.');
    expect(connection.on).toHaveBeenCalledWith('AiAnalysisCompleted', expect.any(Function));
    expect(connection.start).toHaveBeenCalledOnce();
  });
});
