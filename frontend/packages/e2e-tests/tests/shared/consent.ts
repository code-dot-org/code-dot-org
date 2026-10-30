import type {Page} from '@playwright/test';

import {setCookie} from './cookies';

/**
 * Suppress the OneTrust cookie-consent overlay by setting its dismiss cookies.
 * Call before navigating to any page where clicks are needed — the overlay
 * intercepts all pointer events until dismissed. The overlay is global (it can
 * appear on any page), so this is a free helper rather than a page/component
 * method, mirroring setCountryOverride in shared/geolocation.ts.
 */
export async function suppressCookieConsentOverlay(page: Page): Promise<void> {
  await setCookie(page, 'OptanonAlertBoxClosed', new Date().toISOString());
  await setCookie(
    page,
    'OptanonConsent',
    'isGpcEnabled=0&interactionCount=1&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1',
  );
}
