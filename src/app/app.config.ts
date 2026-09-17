import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { SIGNALR_NEGOTIATE_URL } from './core/realtime/signalr-hub-connection';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: SIGNALR_NEGOTIATE_URL,
      useValue:
        'https://func-ai-meeting-assistant-dev-mb-btdeargfegebefhb.polandcentral-01.azurewebsites.net/api'
    }
  ]
};
