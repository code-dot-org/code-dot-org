// A world, opened: its main map, with its workspace one switch away.
//
// The map editor is the basic point of view of a world (specs/MAP_FIRST.md,
// "The editor's modes"; specs/MAIN_MAP_PLAN.md). This is the editor Codebridge
// mounts for a `.world`: two views of one file, Map and World, and a bar that
// says which is up. Map is the map editor over the world's `map`; World is
// the Blockly file editor over the whole file, as every `.world` opened in
// before. Each writes the file through the same `onChange`, and each is
// handed the file as the other last left it, so a map edit survives a hat and
// a hat survives a map edit.
//
// One at a time rather than both mounted: a Blockly workspace is not cheap to
// hold hidden, and the two views never need to be seen together.
//
// WHICH ONE IS UP FIRST is the level's to say (`levelData.worldView`): a
// project opens on its map, and a lesson whose task is in the workspace opens
// there. WHETHER THERE IS A MAP VIEW AT ALL is the shelf's: in a gated lab it
// is `place/map`'s grant (`editor: map`), and until then a world is its
// workspace with no bar over it — the lab the first lessons were written for
// (specs/CURRICULUM_PLAN.md). The file is untouched either way: a main map
// nobody can see still loads.

import {useEffect, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {BlocklyFileEditor} from '../blockly/BlocklyFileEditor';
import {worldOpensOn, type WorldLevelProperties} from '../levelData';
import {useMaybeProgression} from '../progression/progressionContext';

import {MapEditor} from './MapEditor';
import styles from './mapEditor.module.css';
import {worldFileDocument} from './worldDocument';

type View = 'map' | 'world';

export const WorldEditor = (props: CustomEditorProps) => {
  const {sourcesEpoch} = useSources<MultiFileSource>();
  const level = useMaybeLevelProperties<WorldLevelProperties>();
  const progression = useMaybeProgression();
  const hasMapView = progression?.holds({kind: 'editor', id: 'map'}) ?? true;
  const [chosen, setView] = useState<View>(() => worldOpensOn(level));
  // Read each render rather than folded into the state: the shelf changes
  // when a lesson is finished, and the view should follow it.
  const view: View = hasMapView ? chosen : 'world';
  // The file as last written by either view, and what the next one opens on.
  const [contents, setContents] = useState(props.initialContents);
  const seenEpoch = useRef(sourcesEpoch);
  useEffect(() => {
    if (seenEpoch.current === sourcesEpoch) {
      return;
    }
    seenEpoch.current = sourcesEpoch;
    setContents(props.initialContents);
  }, [sourcesEpoch, props.initialContents]);

  const write = (next: string) => {
    setContents(next);
    props.onChange(next);
  };

  return (
    <div className={styles.worldEditor}>
      {hasMapView && (
        <div className={styles.viewBar} role="tablist" aria-label="World view">
          <button
            type="button"
            role="tab"
            className={styles.viewButton}
            aria-selected={view === 'map'}
            onClick={() => setView('map')}
          >
            Map
          </button>
          <button
            type="button"
            role="tab"
            className={styles.viewButton}
            aria-selected={view === 'world'}
            onClick={() => setView('world')}
          >
            World
          </button>
        </div>
      )}
      {view === 'map' ? (
        <MapEditor
          key="map"
          {...props}
          initialContents={contents}
          onChange={write}
          document={worldFileDocument}
          onOpenMapScript={() => setView('world')}
        />
      ) : (
        <BlocklyFileEditor
          key="world"
          {...props}
          initialContents={contents}
          onChange={write}
        />
      )}
    </div>
  );
};

export default WorldEditor;
