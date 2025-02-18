// Carefully import only what works in a web worker.
import mm from '@magenta/music/es6';
import {sequences} from '@magenta/music/es6/core';
import {MusicRNN} from '@magenta/music/es6/music_rnn';

import {InstrumentTickEvent} from '../player/interfaces/InstrumentEvent';

import {musiclabMidiDrumNotes, reverseMidiMapping} from './constants';
import {Message} from './types';

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

const midiDrums = Object.values(musiclabMidiDrumNotes);

onmessage = async e => {
  if (e.data[0] === Message.GeneratePattern) {
    try {
      const startTime = Date.now();
      const result = await generatePattern(
        e.data[1],
        e.data[2],
        e.data[3],
        e.data[4]
      );
      postMessage([Message.Result, result, Date.now() - startTime]);
    } catch (e) {
      // Using setTimeout to ensure the error is handled by the onerror callback.
      setTimeout(() => {
        throw e;
      });
    }
  }
};

async function generatePattern(
  seed: InstrumentTickEvent[],
  seedLength: number,
  generateLength: number,
  temperature: number
) {
  if (!model) {
    const createModelStartTime = Date.now();
    model = new MusicRNN(
      'https://curriculum.code.org/media/musiclab/ai/music_rnn/drum_kit_rnn'
    );
    await model.initialize();
    postMessage([Message.ModelCreated, Date.now() - createModelStartTime]);
  }

  const generatePatternStartTime = Date.now();
  const seedSeq = toNoteSequence(seed, seedLength);
  const result = model
    .continueSequence(seedSeq, generateLength, temperature)
    .then(r => seed.concat(fromNoteSequence(r)));

  postMessage([
    Message.GenerateFinished,
    Date.now() - generatePatternStartTime,
  ]);

  return result;
}

function toNoteSequence(pattern: InstrumentTickEvent[], patternLength: number) {
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

function fromNoteSequence(seq: mm.INoteSequence): InstrumentTickEvent[] {
  const res: InstrumentTickEvent[] = [];

  if (seq.notes) {
    for (const {pitch, quantizedStartStep} of seq.notes) {
      if (
        quantizedStartStep !== undefined &&
        quantizedStartStep !== null &&
        pitch !== undefined &&
        pitch !== null
      ) {
        res.push({
          note: midiDrums.indexOf(
            reverseMidiMapping.get(pitch) || musiclabMidiDrumNotes.kick
          ),
          tick: 8 + quantizedStartStep + 1, // 4 + quantizedStartStep * 2 + 1,
        });
      }
    }
  }

  return res;
}
