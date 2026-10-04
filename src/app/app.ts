import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';

import { ScreenWakeLockService } from './core/display/screen-wake-lock.service';
import { SignalRAiAnalysisService } from './core/realtime/signalr-ai-analysis.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly signalRAiAnalysisService = inject(SignalRAiAnalysisService);

  protected readonly analysisText = this.signalRAiAnalysisService.analysisText;
  protected readonly screenWakeLock = inject(ScreenWakeLockService);

  constructor() {
    this.screenWakeLock.start();
    inject(DestroyRef).onDestroy(() => this.screenWakeLock.stop());
  }
}
