import { inject, Injectable, signal } from '@angular/core';

import { AiAnalysisCompleted } from './ai-analysis-completed';
import { SIGNALR_HUB_CONNECTION } from './signalr-hub-connection';

@Injectable({
  providedIn: 'root'
})
export class SignalRAiAnalysisService {
  private readonly hubConnection = inject(SIGNALR_HUB_CONNECTION);

  readonly analysisText = signal('Waiting for AI analysis.');

  constructor() {
    this.hubConnection.on('AiAnalysisCompleted', (notification: AiAnalysisCompleted) => {
      this.analysisText.set(notification.text);
    });

    void this.hubConnection.start().catch(() => undefined);
  }
}
