import mm, {MusicRNN, sequences} from '@magenta/music/es6';

import {PatternTickEvent} from '../player/interfaces/PatternEvent';

const model = new MusicRNN(
  'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn'
);
model.initialize();

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

export function generatePattern(
  seed: PatternTickEvent[],
  length: number,
  temperature: number
) {
  const seedSeq = toNoteSequence(seed);
  return model
    .continueSequence(seedSeq, length, temperature)
    .then(r => seed.concat(fromNoteSequence(r, length)));
}

function toNoteSequence(pattern: PatternTickEvent[]) {
  return sequences.quantizeNoteSequence(
    {
      ticksPerQuarter: 220,
      totalTime: 4 / 2,
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
          tick: 4 + quantizedStartStep + 1, // 4 + quantizedStartStep * 2 + 1,
          src: 'sound_' + ((reverseMidiMapping.get(pitch) || 0) + 1),
        });
      }
    }
  }

  return res;
}
