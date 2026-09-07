// The shelves a project imports from, mounted once for the whole lab.
//
// Five dialogs — effects, rules, actors, appearances (sprites, animations and
// backdrops) and sounds — each opened through the seam a Blockly field asks
// on (`blockly/libraryImport`). They lived in `BlocklyFileEditor`, which is
// where the only caller was: a dropdown's `(import…)` row, in a workspace that
// was on screen because a Blockly file was open.
//
// THAT STOPPED BEING THE ONLY CALLER. The file menus in the tab bar offer the
// same import for the same folder, and they are there whatever is open — an
// image, a map, nothing at all. An editor that owns the dialogs can only open
// them while it is mounted, so `import a sound` from the Sound menu did
// nothing at all with a PNG in the editor: the seam has no handler registered,
// and a request with nobody listening resolves undefined, which is the right
// behavior for a headless generator and a silent failure here.
//
// So the dialogs are the LAB's, mounted beside the workspace rather than
// inside one editor, and both callers ask the same way. Nothing about the seam
// changed — this is the same registration, one level up, where it is always
// registered.
//
// WHAT DID NOT MOVE, and why: the sprite PICKER and the rules panel. Neither
// is an import. The picker chooses a value for a field and can only be opened
// from a block; the panel lists what a world holds and is opened from the
// world block. Both still live in the editor, and both reach these shelves the
// way anything else does — by asking, and awaiting what comes back. That
// replaced a pair of shared refs with a promise, which is what the seam was
// for.

import {useCallback, useEffect, useRef, useState} from 'react';

import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {setActorImportHandler} from '../actors/actorImport';
import {setActorEnhanceHandler} from '../actors/enhance/actorEnhance';
import {EnhanceActorDialog} from '../actors/enhance/EnhanceActorDialog';
import type {Enhancement, EnhanceTarget} from '../actors/enhance/enhancements';
import {ImportActorDialog} from '../actors/ImportActorDialog';
import {importStockActor} from '../actors/importStockActor';
import type {StockActor} from '../actors/stock';
import {
  setAppearanceImportHandler,
  type AppearanceKind,
} from '../appearance/appearanceImport';
import {BackgroundLibraryDialog} from '../appearance/BackgroundLibraryDialog';
import {fetchStockBackground} from '../appearance/fetchStockBackground';
import {ImportAppearanceDialog} from '../appearance/ImportAppearanceDialog';
import {
  importStockAnimation,
  importStockBackground,
  importStockSprite,
} from '../appearance/importStock';
import type {
  StockAnimation,
  StockBackground,
  StockSprite,
} from '../appearance/stock';
import {setEffectImportHandler} from '../blockly/effectImport';
import {setRuleImportHandler} from '../blockly/ruleImport';
import {ImportEffectDialog} from '../effect/ImportEffectDialog';
import {importStockEffect} from '../effect/importStockEffect';
import type {StockEffect} from '../effect/stock';
import {ImportRuleDialog} from '../rules/ImportRuleDialog';
import {importStockRule} from '../rules/importStockRule';
import type {StockRule} from '../rules/stock';
import {fetchStockSound} from '../sound/fetchStockSound';
import {importStockSound} from '../sound/importStockSound';
import {setSoundImportHandler} from '../sound/soundImport';
import {SoundLibraryDialog} from '../sound/SoundLibraryDialog';
import type {StockSound} from '../sound/stock';

import {refreshFor} from './refreshRegistries';

/** Which shelf is open. One at a time, which is what a modal means anyway. */
type Shelf =
  | 'effect'
  | 'rule'
  | 'actor'
  | AppearanceKind
  | 'sound'
  // …and the one that is not a shelf: enhancing carries the actor it is being
  // done to, chosen on that actor's row before anything opened.
  | {enhancing: EnhanceTarget}
  | null;

/**
 * Mount the import shelves and register the seams they answer.
 *
 * Renders nothing until something asks. The host mounts one, high enough that
 * it outlives whichever editor is showing.
 */
export const LibraryImports = () => {
  const {currentSources, updateSources, replaceSources} =
    useSources<MultiFileSource>();
  const [shelf, setShelf] = useState<Shelf>(null);
  /** What the asker is waiting on: the value the field should take, or none. */
  const resolve = useRef<((value: string | undefined) => void) | null>(null);
  // Read at import time rather than captured, so the file is written against
  // the project as it stands when the learner chooses, not as it stood when
  // the dialog opened.
  const sourcesRef = useRef(currentSources);
  sourcesRef.current = currentSources;

  /** A shelf, and the promise the asker waits on while it is open. */
  const open = useCallback(
    (which: Exclude<Shelf, null>) =>
      new Promise<string | undefined>(settle => {
        resolve.current = settle;
        setShelf(which);
      }),
    [],
  );

  const finish = useCallback((value: string | undefined) => {
    setShelf(null);
    resolve.current?.(value);
    resolve.current = null;
  }, []);

  useEffect(() => {
    setEffectImportHandler(() => open('effect'));
    setRuleImportHandler(() => open('rule'));
    setActorImportHandler(() => open('actor'));
    setActorEnhanceHandler((target: EnhanceTarget) =>
      open({enhancing: target}),
    );
    setSoundImportHandler(() => open('sound'));
    setAppearanceImportHandler(kind => open(kind));
    // Cleared on unmount so nothing can open a dialog that is no longer here.
    return () => {
      setEffectImportHandler(null);
      setRuleImportHandler(null);
      setActorImportHandler(null);
      setActorEnhanceHandler(null);
      setSoundImportHandler(null);
      setAppearanceImportHandler(null);
    };
  }, [open]);

  /**
   * Write the file, refresh every registry, and hand back the value.
   *
   * The order is the whole of it: the file has to be in the project BEFORE the
   * field takes its value, because the dropdown rebuilds from the registry and
   * a value with no matching option is dropped by Blockly.
   */
  const took = useCallback(
    (source: MultiFileSource, value: string) => {
      updateSources({...sourcesRef.current, source});
      refreshFor(source);
      finish(value);
    },
    [updateSources, finish],
  );

  /**
   * The same, for a change that REWRITES files rather than adding one.
   *
   * `replaceSources` and not `updateSources`, which is the difference between
   * the two (SourcesContext): an import writes a file nothing is showing, and
   * an editor has nothing to re-read. An enhancement rewrites an actor whose
   * workspace may be open — and an editor showing the old one goes on showing
   * it, then writes that stale workspace back over the change on the next
   * keystroke. Bumping the epoch is how an open editor finds out, and it is
   * what the AI tutor's edits already use for the same reason.
   */
  const changed = useCallback(
    (source: MultiFileSource, value: string) => {
      replaceSources({...sourcesRef.current, source});
      refreshFor(source);
      finish(value);
    },
    [replaceSources, finish],
  );

  // The two shelves whose bytes are SERVED rather than bundled (BACKGROUNDS.md
  // §7, specs/SOUND.md): choosing one is a fetch before it is an edit, so the
  // dialog stays open and says so. One that vanished and then failed would
  // leave the learner with nothing to look at and nothing to try again.
  const [fetching, setFetching] = useState(false);
  const [failure, setFailure] = useState<string | undefined>();

  const fetched = useCallback(
    async (
      get: () => Promise<string>,
      write: (dataUrl: string) => {source: MultiFileSource; value: string},
    ): Promise<void> => {
      setFailure(undefined);
      setFetching(true);
      let dataUrl: string;
      try {
        dataUrl = await get();
      } catch (error) {
        setFetching(false);
        setFailure(error instanceof Error ? error.message : String(error));
        return;
      }
      setFetching(false);
      const {source, value} = write(dataUrl);
      took(source, value);
    },
    [took],
  );

  const cancel = useCallback(() => {
    setFailure(undefined);
    finish(undefined);
  }, [finish]);

  return (
    <>
      {shelf === 'effect' && (
        <ImportEffectDialog
          onImport={(effect: StockEffect) => {
            const {source, path} = importStockEffect(
              sourcesRef.current.source,
              effect,
            );
            took(source, path);
          }}
          onCancel={cancel}
        />
      )}
      {shelf === 'rule' && (
        <ImportRuleDialog
          onImport={(rule: StockRule) => {
            // The value is the rule's NAME — a rule field says which rule,
            // never which file (`useRuleOptions`).
            const {source, name} = importStockRule(
              sourcesRef.current.source,
              rule,
            );
            took(source, name);
          }}
          onCancel={cancel}
        />
      )}
      {shelf !== null && typeof shelf === 'object' && (
        // Not an import: this one EDITS the actor it was given, so the source
        // goes in as well as out — the dialog reads it to say what that actor
        // already has (`actors/enhance`).
        <EnhanceActorDialog
          source={sourcesRef.current.source}
          target={shelf.enhancing}
          onEnhance={(enhancement: Enhancement, answer?: string) =>
            // The actor's path back, so a caller waiting on this knows what
            // changed; nothing asks yet, and the seam hands back a string.
            changed(
              enhancement.apply(
                sourcesRef.current.source,
                shelf.enhancing,
                answer,
              ),
              shelf.enhancing.path,
            )
          }
          onCancel={cancel}
        />
      )}
      {shelf === 'actor' && (
        <ImportActorDialog
          onImport={(actor: StockActor) => {
            // …and here the MODULE PATH: an actor dropdown says which file
            // (`actorFieldOptions`).
            const {source, path} = importStockActor(
              sourcesRef.current.source,
              actor,
            );
            took(source, path);
          }}
          onCancel={cancel}
        />
      )}
      {shelf === 'background' && (
        <BackgroundLibraryDialog
          busy={fetching}
          error={failure}
          onImport={(chosen: StockBackground) =>
            fetched(
              () => fetchStockBackground(chosen),
              dataUrl =>
                importStockBackground(
                  sourcesRef.current.source,
                  chosen,
                  dataUrl,
                ),
            )
          }
          onCancel={cancel}
        />
      )}
      {shelf === 'sound' && (
        <SoundLibraryDialog
          busy={fetching}
          error={failure}
          onImport={(chosen: StockSound) =>
            fetched(
              () => fetchStockSound(chosen),
              dataUrl =>
                importStockSound(sourcesRef.current.source, chosen, dataUrl),
            )
          }
          onCancel={cancel}
        />
      )}
      {(shelf === 'sprite' || shelf === 'animation') && (
        <ImportAppearanceDialog
          kind={shelf}
          onImport={(chosen: StockSprite | StockAnimation) => {
            const {source, value} =
              'dataUrl' in chosen
                ? importStockSprite(sourcesRef.current.source, chosen)
                : importStockAnimation(sourcesRef.current.source, chosen);
            took(source, value);
          }}
          onCancel={cancel}
        />
      )}
    </>
  );
};
