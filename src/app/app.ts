import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SignalRAiAnalysisService } from './core/realtime/signalr-ai-analysis.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly signalRAiAnalysisService = inject(SignalRAiAnalysisService);

  protected readonly analysisText = this.signalRAiAnalysisService.analysisText;
}
