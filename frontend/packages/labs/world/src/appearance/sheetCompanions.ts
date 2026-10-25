// Keeping a `.sheet` with the `.png` it belongs to.
//
// A `.sheet` is not a file in its own right: it says how to cut the image of the
// same name, in the same folder, into cells (sheetFile). The learner never sees
// it — the file browser does not list it — so it cannot be dragged, renamed or
// deleted by hand, which means every one of those things has to happen to it
// automatically or not at all.
//
// So it follows its image through every file operation: the work is
// `files/companions`, which a Screen's or Map's picture shares.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {followOwners, type Companion} from '../files/companions';

import {sheetFileName} from './sheetFile';

/** A `.sheet` belongs to the `.png` of the same name, in the same folder. */
const SHEETS: Companion = {
  owns: file => file.name.toLowerCase().endsWith('.png'),
  nameFor: sheetFileName,
};

/**
 * The project after a file operation, with every `.sheet` back beside its image.
 *
 * Returns `next` unchanged when nothing needed doing, which is almost always.
 */
export const followImages = (
  next: MultiFileSource,
  previous: MultiFileSource,
): MultiFileSource => followOwners(next, previous, SHEETS);
