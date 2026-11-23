import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {initializeGoogleAnalytics} from '..';

const DIMENSIONS = {dimension4: 'teacher', dimension5: 'test'};

function stampMeasurement() {
  const stamp = document.createElement('script');
  stamp.setAttribute('data-googleMeasurement', '{"id":"G-TEST"}');
  document.head.appendChild(stamp);
}

// gtag pushes its arguments object; spread it to compare as an array.
const calls = () =>
  (window.dataLayer ?? []).map(entry =>
    Array.isArray(entry) || typeof entry !== 'object' || !('length' in entry!)
      ? entry
      : Array.from(entry as ArrayLike<unknown>),
  );

describe('initializeGoogleAnalytics', () => {
  beforeEach(() => {
    window.userAnalyticsDimensions = DIMENSIONS;
  });

  afterEach(() => {
    document.head.innerHTML = '';
    delete window.dataLayer;
    delete window.trackEvent;
    delete window.userAnalyticsDimensions;
  });

  it('does nothing when the shell stamped no measurement id', () => {
    initializeGoogleAnalytics();

    expect(window.dataLayer).toBeUndefined();
    expect(document.querySelector('script[src*="gtm.js"]')).toBeNull();
  });

  it('configures the stamped measurement id with the user dimensions', () => {
    stampMeasurement();

    initializeGoogleAnalytics();

    expect(calls()[0]).toEqual(['js', expect.any(Date)]);
    expect(calls()[1]).toEqual(['config', 'G-TEST', DIMENSIONS]);
  });

  it('loads Google Tag Manager', () => {
    stampMeasurement();

    initializeGoogleAnalytics();

    expect(calls()[2]).toEqual({
      'gtm.start': expect.any(Number),
      event: 'gtm.js',
    });
    expect(
      document.querySelector<HTMLScriptElement>('script[src*="gtm.js"]')?.src,
    ).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TZZBRK5');
  });

  it('exposes trackEvent, which sends the category as eventCategory', () => {
    stampMeasurement();
    initializeGoogleAnalytics();

    window.trackEvent?.('account', 'saved', {tab: 'details'});

    expect(calls().at(-1)).toEqual([
      'event',
      'saved',
      {eventCategory: 'account', tab: 'details'},
    ]);
  });
});
