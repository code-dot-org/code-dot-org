import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import MusicRegistry from '../MusicRegistry';
import {InstrumentTickEvent} from '../player/interfaces/InstrumentEvent';

import {Message} from './types';

// @ts-expect-error because
const worker = new Worker(new URL('patternAiWorker.ts', import.meta.url));

// Track the first generate attempt per page load separately, as it typically
// takes much longer than subsequent attempts.
let isInitialGenerate = true;

export function generatePattern(
  seed: InstrumentTickEvent[],
  seedLength: number,
  generateLength: number,
  temperature: number,
  onComplete: (result: InstrumentTickEvent[]) => void,
  onError: (error: Error) => void
) {
  const reporter = Lab2Registry.getInstance().getMetricsReporter();
  const analyticsReporter = MusicRegistry.analyticsReporter;
  // Report attempt
  reporter.incrementCounter('MusicAI.GeneratePatternAttempt');
  analyticsReporter.onGenerateAiPatternStart();

  worker.postMessage([
    Message.GeneratePattern,
    seed,
    seedLength,
    generateLength,
    temperature,
  ]);
  worker.onmessage = e => {
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
          isInitialGenerate
        );
        onComplete(e.data[1]);
        // Flip the flag after the first successful generate.
        isInitialGenerate = false;
        break;
    }
  };

  worker.onmessageerror = e => {
    reportError(reporter, new Error(e.data), 'MessageError');
    onError(new Error(e.data));
  };

  worker.onerror = e => {
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
  isInitialGenerate: boolean
) {
  console.log(`Music AI: Generate pattern time: ${timeMs}ms`);
  reporter.reportLoadTime('MusicAI.GeneratePatternTime', timeMs, [
    {name: 'Instance', value: isInitialGenerate ? 'Initial' : 'Subsequent'},
  ]);
}

function reportError(
  reporter: LabMetricsReporter,
  error: Error,
  value: 'MessageError' | 'GeneralError'
) {
  reporter.logError('Error generating AI pattern', error, {error});
  reporter.incrementCounter('MusicAI.GeneratePatternError', [
    {name: 'Type', value},
  ]);
}
