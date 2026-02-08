import {GTM_ID} from './constants';
import type {GoogleTagManagerEvent} from './types';

declare global {
  interface Window {
    dataLayer?: GoogleTagManagerEvent[];
  }
}

/**
 * Initializes the Google Tag Manager.
 *
 * This needs to be run on the client-side of the page the first time
 * it loads as soon as possible.
 */
export const initialize = (w: Window, d: Document, i: string = GTM_ID) => {
  // Create the dataLayer
  w.dataLayer ||= [];

  // Don't re-initialize if it is already done
  if (w.dataLayer.length > 0) {
    return;
  }

  // Push a start event
  w.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});

  // Create the script element and find its anchor
  const f = d.getElementsByTagName('script')[0],
    j = d.createElement('script');

  // Establish the script tag and insert it as the first script
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i;
  f.parentNode?.insertBefore(j, f);
};
// End Google Tag Manager

/**
 * Report an event to Google Analytics.
 * trackEvent is provided by _analytics.html.haml in most cases.
 * In those where it isn't, we want this call to be a simple no-op.
 */
export const trackEvent = (
  categoryValue: string,
  actionName: string,
  parameters: object = {},
) => {
  window.dataLayer?.push([
    'event',
    actionName,
    {
      eventCategory: categoryValue,
      ...parameters,
    },
  ]);
};
