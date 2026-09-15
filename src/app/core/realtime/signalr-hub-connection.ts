import { inject, InjectionToken } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';

import { AiAnalysisCompleted } from './ai-analysis-completed';

export interface SignalRHubConnection {
  on(eventName: string, callback: (notification: AiAnalysisCompleted) => void): void;
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
        .withUrl(inject(SIGNALR_NEGOTIATE_URL))
        .withAutomaticReconnect()
        .build()
  }
);
