// Screen-reader announcements for a maze run: a polite "step" region narrates
// each animated action, an assertive "result" region delivers the outcome.

import {ResultType, TestResults} from '../constants';

const HOST_ID = 'maze-announcer';
const RESULT_REGION_ID = 'maze-result-announcer';
const STEP_REGION_ID = 'maze-step-announcer';

const SR_ONLY: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: '0',
};

interface ResultInfo {
  result: number; // ResultType
  testResults: number; // TestResults
  message?: string;
}

// Focus parks here, not on the live regions: VoiceOver suffixes a focused live
// region's updates with its role ("group"). aria-label names the focus landing.
function getHost(): HTMLElement {
  let host = document.getElementById(HOST_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = HOST_ID;
    host.setAttribute('tabindex', '-1');
    host.setAttribute('aria-label', 'Maze');
    host.style.outline = 'none';
    Object.assign(host.style, SR_ONLY);
    document.body.appendChild(host);
  }
  return host;
}

// Bare aria-live (no role/aria-atomic) is the only shape VoiceOver+Chrome
// announces reliably; matches the sketchlab announcer.
function getRegion(id: string, assertive: boolean): HTMLElement {
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    getHost().appendChild(region);
  }
  return region;
}

// Create up front: AT ignores a live region created in the same tick as its
// first text.
export function setupResultAnnouncer(): void {
  getHost();
  getRegion(RESULT_REGION_ID, true);
  getRegion(STEP_REGION_ID, false);
}

export function focusAnnouncer(): void {
  getHost().focus();
}

export function teardownResultAnnouncer(): void {
  document.getElementById(HOST_ID)?.remove();
}

// Alternating zero-width space keeps identical consecutive text a distinct
// change; clear-then-set instead goes silent on VoiceOver+Chrome.
let announceCounter = 0;
function announce(region: HTMLElement, text: string): void {
  announceCounter += 1;
  const padding = '\u200B'.repeat((announceCounter % 2) + 1);
  region.textContent = text + padding;
}

export function describeResult({
  result,
  testResults,
  message,
}: ResultInfo): string {
  if (result === ResultType.SUCCESS) {
    // testResults < ALL_PASS on a success means passed-but-not-optimal.
    const imperfect = testResults < TestResults.ALL_PASS;
    const base = 'Success. Character reached the goal.';
    return imperfect && message ? `${base} ${message}` : base;
  }
  if (message) {
    return message;
  }
  switch (result) {
    case ResultType.TIMEOUT:
      return 'Timeout. Goal not reached.';
    case ResultType.ERROR:
      return 'Bonk, character hit a wall.';
    case ResultType.FAILURE:
    default:
      return 'End. Goal not reached.';
  }
}

export function announceResult(info: ResultInfo): void {
  announce(getRegion(RESULT_REGION_ID, true), describeResult(info));
}

export function announceStep(text: string): void {
  if (!text) {
    return;
  }
  announce(getRegion(STEP_REGION_ID, false), text);
}
