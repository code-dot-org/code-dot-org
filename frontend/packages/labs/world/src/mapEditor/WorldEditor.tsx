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

import {useEffect, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {BlocklyFileEditor} from '../blockly/BlocklyFileEditor';

import {MapEditor} from './MapEditor';
import styles from './mapEditor.module.css';
import {worldFileDocument} from './worldDocument';

type View = 'map' | 'world';

export const WorldEditor = (props: CustomEditorProps) => {
  const {sourcesEpoch} = useSources<MultiFileSource>();
  const [view, setView] = useState<View>('map');
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
