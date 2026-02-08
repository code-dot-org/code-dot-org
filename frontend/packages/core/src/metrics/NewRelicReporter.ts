/**
 * Logs to NewRelic.
 */

import type {BrowserAgent} from '@newrelic/browser-agent';

declare global {
  interface Window {
    newrelic: BrowserAgent;
  }
}

export const PageActions = {
  DropletTransitionError: 'DropletTransitionError',
  SanitizedLevelHtml: 'SanitizedLevelHtml',
  UserJavaScriptError: 'UserJavaScriptError',
  RunButtonClick: 'RunButtonClick',
  StartWebRequest: 'StartWebRequest',
  StaticResourceFetchError: 'StaticResourceFetchError',
  PegasusSectionsRedirect: 'PegasusSectionsRedirect',
  DancePartyOnInit: 'DancePartyOnInit',
  BrambleError: 'BrambleError',
  BrambleFilesystemResetSuccess: 'BrambleFilesystemResetSuccess',
  BrambleFilesystemResetFailed: 'BrambleFilesystemResetFailed',
  JotFormFrameLoaded: 'JotFormFrameLoaded',
  JotFormLoadFailed: 'JotFormLoadFailed',
  BlockLoadFailed: 'BlockLoadFailed',
  MapboxMarkerLoadError: 'MapboxMarkerLoadError',
  LoadScriptProgressStarted: 'LoadScriptProgressStarted',
  LoadScriptProgressFinished: 'LoadScriptProgressFinished',
  SectionProgressRenderedWithData: 'SectionProgressRenderedWithData',
  JavabuilderWebSocketConnectionError: 'JavabuilderWebSocketConnectionError',
  NoValidAmplitudeEventNameError: 'NoValidAmplitudeEventNameError',
  NoValidStatsigEventNameError: 'NoValidStatsigEventNameError',
} as const;

export type PageAction = (typeof PageActions)[keyof typeof PageActions];

const MAX_FIELD_LENGTH = 4095;
const REPORT_PAGE_SIZE: boolean = Math.random() < 0.01;

export const addPageAction = (
  actionName: string,
  value: {[key: string]: boolean | string | number | object},
  sampleRate: number = 1.0,
) => {
  if (!window.newrelic) {
    return;
  }

  if (actionName in PageActions) {
    console.log('Unknown actionName: ' + actionName);
    return;
  }

  if (typeof value !== 'object') {
    console.log('Expected value to be an object');
    return;
  }

  if (Math.random() > sampleRate) {
    // Ignore this instance
    return;
  }

  for (const prop in value) {
    // New relic doesnt handle booleans. Make them strings.
    if (typeof value[prop] === 'boolean') {
      value[prop] = value[prop].toString();
    }

    if (typeof value[prop] === 'string') {
      value[prop] = value[prop].substring(0, MAX_FIELD_LENGTH);
    }
  }

  window.newrelic.addPageAction(
    actionName,
    value as unknown as {[key: string]: string | number},
  );
};

export const setCustomAttribute = (key: string, value: string | number) => {
  if (!window.newrelic) {
    return;
  }

  window.newrelic.setCustomAttribute(key, value);
};

export const loadFinished = () => {
  if (!window.newrelic) {
    return;
  }

  window.newrelic.finished();
};

export const logError = (e: Error) => {
  if (!window.newrelic) {
    return;
  }

  window.newrelic.noticeError(e);
};

export const reportPageSize = () => {
  if (!REPORT_PAGE_SIZE) {
    return;
  }

  try {
    const resources: PerformanceResourceTiming[] =
      (performance?.getEntriesByType('resource') ||
        []) as unknown as PerformanceResourceTiming[];
    let totalDownloadSize = 0;
    let jsDownloadSize = 0;
    const jsFileRegex = /\.js$/;
    for (const resource of resources) {
      if (
        resource.transferSize === undefined ||
        resource.encodedBodySize === undefined
      ) {
        return;
      }

      totalDownloadSize += resource.transferSize;
      if (jsFileRegex.test(resource.name)) {
        jsDownloadSize += resource.transferSize;
      }
    }
    if (!window.newrelic) {
      return;
    }
    window.newrelic.setCustomAttribute('totalDownloadSize', totalDownloadSize);
    window.newrelic.setCustomAttribute('jsDownloadSize', jsDownloadSize);
  } catch (error) {
    if (error instanceof Error) {
      logError(error);
    }
  }
};
