# AiMeetingAssistantWebClient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Keeping the display awake

The client automatically requests a screen wake lock while its page is visible,
including while waiting for the next AI response. It releases the lock when the
page is hidden or the app is destroyed, and requests a new lock when the page
becomes visible again. Returning from the browser's back/forward cache is handled
through the page lifecycle events as well.

Screen Wake Lock requires HTTPS (or a trustworthy local development origin) and
browser support. The device may reject or release it because of battery or power
saving settings. In that case a small notice provides a retry button; unsupported
browsers show a device-settings hint. AI notifications continue to work even if
the lock is unavailable. The client cannot keep a background tab awake or prevent
the user from locking the phone manually.

After deployment, open the client on the phone, keep the page visible longer than
the configured screen timeout, and verify that the display stays on. Switch away
and return to check reacquisition. Also test the notice with power saving enabled
if the device denies the request. Physical-device behavior must be checked separately
from the mocked unit tests.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
