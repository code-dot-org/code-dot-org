import type {LabMetricsReporter} from '@code-dot-org/lab';
import {LabRegistry} from '@code-dot-org/lab';

import MusicRegistry from '../MusicRegistry';
import type {InstrumentTickEvent} from '../player/interfaces/InstrumentEvent';

import {Message} from './types';

import PatternAiWorker from './patternAiWorker?worker';

let worker: Worker | undefined;

function getWorker() {
  if (!worker) {
    worker = new PatternAiWorker();
  }
  return worker;
}

// Track the first generate attempt per page load separately, as it typically
// takes much longer than subsequent attempts.
let isInitialGenerate = true;

export function generatePattern(
  seed: InstrumentTickEvent[],
  seedLength: number,
  generateLength: number,
  temperature: number,
  onComplete: (result: InstrumentTickEvent[]) => void,
  onError: (error: Error) => void,
) {
  const reporter = LabRegistry.metricsReporter;
  const analyticsReporter = MusicRegistry.analyticsReporter;

  // Report attempt
  reporter.incrementCounter('MusicAI.GeneratePatternAttempt');
  analyticsReporter.onGenerateAiPatternStart(temperature);

  const w = getWorker();
  w.postMessage([
    Message.GeneratePattern,
    seed,
    seedLength,
    generateLength,
    temperature,
  ]);
  w.onmessage = e => {
    switch (e.data[0]) {
      case Message.ModelCreated:
        reportCreateModelTime(reporter, e.data[1]);
        break;
      case Message.GenerateFinished:
        reportGeneratePatternTime(reporter, e.data[1], isInitialGenerate);
        break;
      case Message.Result:
        analyticsReporter.onGenerateAiPatternEnd(
          e.data[2] / 1000,
          isInitialGenerate,
          temperature,
        );
        onComplete(e.data[1]);
        // Flip the flag after the first successful generate.
        isInitialGenerate = false;
        break;
    }
  };

  w.onmessageerror = e => {
    reportError(reporter, new Error(e.data), 'MessageError');
    onError(new Error(e.data));
  };

  w.onerror = e => {
    reportError(reporter, e.error || e.message, 'GeneralError');
    onError(e.error || e.message);
  };
}

function reportCreateModelTime(reporter: LabMetricsReporter, timeMs: number) {
  console.log(`Music AI: Create model time: ${timeMs}ms`);
  reporter.reportLoadTime('MusicAI.CreateModelTime', timeMs);
}

function reportGeneratePatternTime(
  reporter: LabMetricsReporter,
  timeMs: number,
  isInitialGenerate: boolean,
) {
  console.log(`Music AI: Generate pattern time: ${timeMs}ms`);
  reporter.reportLoadTime('MusicAI.GeneratePatternTime', timeMs, [
    {name: 'Instance', value: isInitialGenerate ? 'Initial' : 'Subsequent'},
  ]);
}

function reportError(
  reporter: LabMetricsReporter,
  error: Error,
  value: 'MessageError' | 'GeneralError',
) {
  reporter.logError('Error generating AI pattern', error, {error});
  reporter.incrementCounter('MusicAI.GeneratePatternError', [
    {name: 'Type', value},
  ]);
}
