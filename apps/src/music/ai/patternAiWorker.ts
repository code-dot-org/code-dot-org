// Carefully import only what works in a web worker.
import mm from '@magenta/music/es6';
import {sequences} from '@magenta/music/es6/core';
import {MusicRNN} from '@magenta/music/es6/music_rnn';

import {PatternTickEvent} from '../player/interfaces/PatternEvent';

let model: MusicRNN | undefined = undefined;

// This component is adapted from Neural Drum Machine by Tero Parviainen.
//
// Its license is reproduced here:
//
// Copyright (c) 2024 by Tero Parviainen (https://codepen.io/teropa/pen/JLjXGK)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const midiDrums = [36, 38, 42, 46, 41, 43, 45, 49, 51];
const reverseMidiMapping = new Map([
  [36, 0],
  [35, 0],
  [38, 1],
  [27, 1],
  [28, 1],
  [31, 1],
  [32, 1],
  [33, 1],
  [34, 1],
  [37, 1],
  [39, 1],
  [40, 1],
  [56, 1],
  [65, 1],
  [66, 1],
  [75, 1],
  [85, 1],
  [42, 2],
  [44, 2],
  [54, 2],
  [68, 2],
  [69, 2],
  [70, 2],
  [71, 2],
  [73, 2],
  [78, 2],
  [80, 2],
  [46, 3],
  [67, 3],
  [72, 3],
  [74, 3],
  [79, 3],
  [81, 3],
  [45, 4],
  [29, 4],
  [41, 4],
  [61, 4],
  [64, 4],
  [84, 4],
  [48, 5],
  [47, 5],
  [60, 5],
  [63, 5],
  [77, 5],
  [86, 5],
  [87, 5],
  [50, 6],
  [30, 6],
  [43, 6],
  [62, 6],
  [76, 6],
  [83, 6],
  [49, 7],
  [55, 7],
  [57, 7],
  [58, 7],
  [51, 8],
  [52, 8],
  [53, 8],
  [59, 8],
  [82, 8],
]);

onmessage = async e => {
  if (e.data[0] === 'generatePattern') {
    const result = await generatePattern(
      e.data[1],
      e.data[2],
      e.data[3],
      e.data[4]
    );
    postMessage(['result', result]);
  }
};

async function generatePattern(
  seed: PatternTickEvent[],
  seedLength: number,
  generateLength: number,
  temperature: number
) {
  if (!model) {
    console.time('AI: create model');
    model = new MusicRNN(
      'https://curriculum.code.org/media/musiclab/ai/music_rnn/drum_kit_rnn'
    );
    console.timeLog('AI: create model');
    await model.initialize();
    console.timeEnd('AI: create model');
  }

  console.time('AI: generate pattern');
  const seedSeq = toNoteSequence(seed, seedLength);
  const result = model
    .continueSequence(seedSeq, generateLength, temperature)
    .then(r => seed.concat(fromNoteSequence(r, generateLength)));
  console.timeEnd('AI: generate pattern');

  return result;
}

function toNoteSequence(pattern: PatternTickEvent[], patternLength: number) {
  return sequences.quantizeNoteSequence(
    {
      ticksPerQuarter: 220,
      totalTime: patternLength / 2,
      timeSignatures: [
        {
          time: 0,
          numerator: 4,
          denominator: 4,
        },
      ],
      tempos: [
        {
          time: 0,
          qpm: 120,
        },
      ],
      notes: pattern.map(patternEntry => {
        return {
          pitch: midiDrums[patternEntry.note],
          startTime: (patternEntry.tick - 1) * 0.5,
          endTime: patternEntry.tick * 0.5,
        };
      }),
    },
    1
  );
}

function fromNoteSequence(
  seq: mm.INoteSequence,
  patternLength: number
): PatternTickEvent[] {
  const res: PatternTickEvent[] = [];

  if (seq.notes) {
    for (const {pitch, quantizedStartStep} of seq.notes) {
      if (
        quantizedStartStep !== undefined &&
        quantizedStartStep !== null &&
        pitch !== undefined &&
        pitch !== null
      ) {
        res.push({
          note: reverseMidiMapping.get(pitch) || 0,
          tick: 8 + quantizedStartStep + 1, // 4 + quantizedStartStep * 2 + 1,
          src: 'sound_' + ((reverseMidiMapping.get(pitch) || 0) + 1),
        });
      }
    }
  }

  return res;
}
