import { inject, InjectionToken } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';

import { AiAnalysisCompleted } from './ai-analysis-completed';
import { AiAnalysisFailed } from './ai-analysis-failed';

export interface SignalRHubConnection {
  on(eventName: 'AiAnalysisCompleted', callback: (notification: AiAnalysisCompleted) => void): void;
  on(eventName: 'AiAnalysisFailed', callback: (notification: AiAnalysisFailed) => void): void;
  start(): Promise<void>;
}

export const SIGNALR_NEGOTIATE_URL = new InjectionToken<string>('SIGNALR_NEGOTIATE_URL', {
  factory: () => 'http://localhost:7071/api/negotiate'
});

export const SIGNALR_HUB_CONNECTION = new InjectionToken<SignalRHubConnection>(
  'SIGNALR_HUB_CONNECTION',
  {
    factory: () =>
      new HubConnectionBuilder()
        .withUrl(inject(SIGNALR_NEGOTIATE_URL), { withCredentials: false })
        .withAutomaticReconnect()
        .build()
  }
);
