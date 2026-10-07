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
// there. BOTH ARE ALWAYS OFFERED. For a day the Map view was something a
// gated lab withheld until `place/map`; the decision since is that neither
// view is ever locked, so a learner can look round the mode they are not in
// and see what is and is not theirs yet there. What a gate withholds is
// INSIDE a view — a toolbox drawer, the Script button, the Layers list —
// never the view (specs/CURRICULUM_PLAN.md, "Decided since").

import {useEffect, useId, useRef, useState} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';
import Tabs from '@code-dot-org/component-library/tabs';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';

import {BlocklyFileEditor} from '../blockly/BlocklyFileEditor';
import {setRevealer} from '../callouts/reveal';
import {worldOpensOn, type WorldLevelProperties} from '../levelData';

import {MapEditor} from './MapEditor';
import styles from './mapEditor.module.css';
import {worldFileDocument} from './worldDocument';

type View = 'map' | 'world';

export const WorldEditor = (props: CustomEditorProps) => {
  const {sourcesEpoch} = useSources<MultiFileSource>();
  const level = useMaybeLevelProperties<WorldLevelProperties>();
  const [view, setView] = useState<View>(() => worldOpensOn(level));
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

  // "Show me" may need one view or the other up before its target exists
  // (`callouts/reveal`). Both are always offered, so there is nothing to
  // refuse: the file is written as it is edited, and leaving a view loses
  // nothing.
  useEffect(() => {
    setRevealer('view', step => setView(step.view));
    return () => setRevealer('view', null);
  }, []);

  // The tabs' ids are made from their group's name, so the name is this
  // editor's own: two worlds open at once must not share one.
  const tabsName = `world-view-${useId().replace(/:/g, '')}`;
  // "Show me" finds a tab by its mark (`callouts/pointAt`), and the design
  // system's tab takes no attributes of ours, so the mark is put on the
  // button it draws.
  useEffect(() => {
    for (const value of ['map', 'world']) {
      document
        .getElementById(`${tabsName}-tab-${value}`)
        ?.setAttribute('data-callout', `view.${value}`);
    }
  }, [tabsName]);

  const write = (next: string) => {
    setContents(next);
    props.onChange(next);
  };

  return (
    <div className={styles.worldEditor}>
      {/* The design system's tabs, with their panels left to this: one
          view mounted at a time, so the panel below is the one tab's. */}
      <div className={styles.viewBar}>
        <Tabs
          name={tabsName}
          type="secondary"
          size="s"
          hidePanels
          defaultSelectedTabValue={view}
          onChange={value => setView(value as typeof view)}
          tabs={[
            {value: 'map', text: 'Map', tabContent: null},
            {value: 'world', text: 'World', tabContent: null},
          ]}
        />
      </div>
      <div
        className={styles.viewPanel}
        role="tabpanel"
        id={`${tabsName}-panel-${view}`}
        aria-labelledby={`${tabsName}-tab-${view}`}
      >
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
    </div>
  );
};

export default WorldEditor;
