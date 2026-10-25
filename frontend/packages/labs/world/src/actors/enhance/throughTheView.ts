// An enhancement made to an actor of either shape (specs/ACTOR_EDITOR_PLAN.md,
// step 3).
//
// Every enhancement reads and writes `define actor` rows: whether this actor
// wears a trait, a row appended under the root. So each is handed the
// project with its data-shaped actors in their view (`actors/actorData`),
// and what it writes to one of those is folded back into data. An actor
// file it makes is left as it made it.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {asActorData, isDataShaped, viewOf} from '../actorData';

import type {Enhancement} from './enhancements';

/** The project with each data-shaped actor in its view, or as it was. */
export function viewedSource(source: MultiFileSource): MultiFileSource {
  let files: MultiFileSource['files'] | undefined;
  for (const [id, file] of Object.entries(source.files)) {
    if (file.name.endsWith('.actor') && isDataShaped(file.contents)) {
      files ??= {...source.files};
      files[id] = {...file, contents: viewOf(file.contents)};
    }
  }
  return files ? {...source, files} : source;
}

/** What an edit of the viewed project did, with the viewed actors data again. */
function foldedLike(
  before: MultiFileSource,
  after: MultiFileSource,
): MultiFileSource {
  let files: MultiFileSource['files'] | undefined;
  for (const [id, file] of Object.entries(after.files)) {
    const was = before.files[id];
    if (was && was.name.endsWith('.actor') && isDataShaped(was.contents)) {
      files ??= {...after.files};
      files[id] =
        file.contents === viewOf(was.contents)
          ? {...file, contents: was.contents}
          : {...file, contents: asActorData(file.contents)};
    }
  }
  return files ? {...after, files} : after;
}

/** The enhancement, asked and applied through the view. */
export function throughTheView(enhancement: Enhancement): Enhancement {
  const {refuse, offered, asks} = enhancement;
  return {
    ...enhancement,
    ...(refuse && {
      refuse: (source, target) => refuse(viewedSource(source), target),
    }),
    ...(offered && {
      offered: (source, target) => offered(viewedSource(source), target),
    }),
    ...(asks && {
      asks: {
        ...asks,
        options: (source, target) => asks.options(viewedSource(source), target),
      },
    }),
    applied: (source, target, answer) =>
      enhancement.applied(viewedSource(source), target, answer),
    apply: (source, target, answer) =>
      foldedLike(
        source,
        enhancement.apply(viewedSource(source), target, answer),
      ),
  };
}
