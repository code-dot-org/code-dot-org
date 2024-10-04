import {DEFAULT_PATTERN_LENGTH} from '../constants';
import {
  PatternEventValue,
  PatternTickEvent,
} from '../player/interfaces/PatternEvent';
import MusicLibrary from '../player/MusicLibrary';

// This file contains a helper function for patterns, and is used by the
// block's custom field.

// A single event from a pattern to be rendered in a graph.
export interface PatternGraphEvent {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GenerateGraphDataFromPatternOptions {
  patternEventValue: PatternEventValue;
  width: number;
  height: number;
  padding: number;
}

// Given a PatternEventValue, generate a set of data for graphing it.
export function generateGraphDataFromPattern({
  patternEventValue,
  width,
  height,
  padding,
}: GenerateGraphDataFromPatternOptions): PatternGraphEvent[] {
  const length = patternEventValue.length || DEFAULT_PATTERN_LENGTH;
  const eventsLength = length * 16;

  // Event widths fit in the space; event heights match the widths.
  const noteWidth = Math.ceil((width - 2 * padding) / eventsLength);
  const noteHeight = noteWidth;

  // Blocks' locations will be for their upper-left corners, so ensure
  // that the space we are filling counts for the full size of the blocks.
  const useWidth = width - 2 * padding - noteWidth;
  const useHeight = height - 2 * padding - noteHeight;

  const currentFolder = MusicLibrary.getInstance()?.getFolderForFolderId(
    patternEventValue.kit
  );
  if (!currentFolder) {
    return [];
  }

  const numSounds = currentFolder.sounds.length;

  return patternEventValue.events.map((event: PatternTickEvent) => {
    return {
      x: 1 + ((event.tick - 1) * useWidth) / (eventsLength - 1) + padding,
      y: 1 + padding + (event.note * useHeight) / (numSounds - 1),
      width: noteWidth,
      height: noteHeight,
      tick: event.tick,
    };
  });
}
