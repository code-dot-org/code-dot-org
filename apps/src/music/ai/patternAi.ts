import {PatternTickEvent} from '../player/interfaces/PatternEvent';

// @ts-expect-error because
const worker = new Worker(new URL('patternAiWorker.ts', import.meta.url));

export function generatePattern(
  seed: PatternTickEvent[],
  length: number,
  temperature: number,
  callback: (result: PatternTickEvent[]) => void
) {
  worker.postMessage(['generatePattern', seed, length, temperature]);
  worker.onmessage = e => {
    if (e.data[0] === 'result') {
      callback(e.data[1]);
    }
  };
}
