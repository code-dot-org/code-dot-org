// The map, on its own, for looking at: `yarn dev` then `?map`.
//
// Milestone 2 of specs/PROGRESSION_UI.md, and the whole of its point is that
// the layout is wrong in ways only a picture shows. So this is deliberately not
// the modal and not the lab — no dialog, no host, no mock API, nothing to load.
// It renders the catalogue and gets out of the way.
//
// Progress here is a toy: a set in component state, seeded so that all three
// tile states are on screen at once, with a button to toggle the selection. The
// real thing is milestone 4.

import {useState} from 'react';

import {TILES} from './catalogue';
import {ProgressionMap} from './ProgressionMap';
import {REGIONS} from './regions';
import type {TileId} from './types';

import {tileState} from './index';

/**
 * Enough of a learner to make the map say something: Origin, all of Motion, and
 * the first of Input — which puts a genre's gate one tile away and so shows a
 * `shut` tile whose reason is visible on screen.
 */
const SEED: readonly TileId[] = [
  'origin/first-world',
  'motion/speed',
  'motion/gravity',
  'motion/force',
  'input/arrows',
];

export const ProgressionMapDemo = () => {
  const [completed, setCompleted] = useState<ReadonlySet<TileId>>(
    new Set(SEED),
  );
  const [selected, setSelected] = useState<TileId | undefined>();
  const tile = TILES.find(t => t.id === selected);
  const state = selected ? tileState(completed, selected) : undefined;

  const toggle = () => {
    if (!selected) {
      return;
    }
    setCompleted(previous => {
      const next = new Set(previous);
      if (!next.delete(selected)) {
        next.add(selected);
      }
      return next;
    });
  };

  return (
    <div className={panel.page}>
      <header className={panel.header}>
        <strong>World Lab progression</strong>
        <span>
          {completed.size} of {TILES.length} done
        </span>
        <span className={panel.hint}>
          click a tile · arrows move · wheel zooms · drag pans
        </span>
        <button type="button" onClick={() => setCompleted(new Set(SEED))}>
          reset
        </button>
      </header>

      <div className={panel.map}>
        <ProgressionMap
          completed={completed}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <aside className={panel.side}>
        {tile ? (
          <>
            <h2>{tile.title}</h2>
            <p className={panel.meta}>
              {REGIONS.find(r => r.id === tile.region)?.name} · {state}
            </p>
            <p>{tile.teaches}</p>
            <p className={panel.task}>{tile.task}</p>
            <h3>Unlocks</h3>
            <ul>
              {tile.unlocks.map(unlock => (
                <li key={JSON.stringify(unlock)}>
                  {unlock.kind}:{' '}
                  {'id' in unlock
                    ? unlock.id
                    : 'name' in unlock
                      ? unlock.name
                      : unlock.type}
                  {unlock.proposed ? ' (proposed)' : ''}
                </li>
              ))}
            </ul>
            <h3>Check ({tile.check.kind})</h3>
            <p>{tile.check.says}</p>
            <p className={panel.meta}>False pass: {tile.check.falsePass}</p>
            <button type="button" onClick={toggle}>
              {completed.has(tile.id) ? 'mark not done' : 'mark done'}
            </button>
          </>
        ) : (
          <p className={panel.meta}>Pick a tile.</p>
        )}
      </aside>
    </div>
  );
};

// Inline styles rather than a stylesheet: this is a dev page, and none of it
// survives into the modal (specs/PROGRESSION_UI.md, milestone 3), so a CSS
// module would be one more file to delete later.
const panel = {
  page: 'progression-demo-page',
  header: 'progression-demo-header',
  map: 'progression-demo-map',
  side: 'progression-demo-side',
  meta: 'progression-demo-meta',
  hint: 'progression-demo-hint',
  task: 'progression-demo-task',
} as const;

export const PROGRESSION_DEMO_CSS = `
.progression-demo-page {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto 1fr;
  height: 100vh;
  font: 14px/1.5 system-ui, sans-serif;
}
.progression-demo-header {
  grid-column: 1 / -1;
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 8px 14px;
  border-bottom: 1px solid #d8d8e0;
}
.progression-demo-hint { margin-left: auto; opacity: 0.6; }
.progression-demo-map { position: relative; min-height: 0; }
.progression-demo-side {
  padding: 14px 16px;
  border-left: 1px solid #d8d8e0;
  overflow-y: auto;
}
.progression-demo-side h2 { margin: 0 0 2px; font-size: 18px; }
.progression-demo-side h3 { margin: 16px 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; }
.progression-demo-side ul { margin: 0; padding-left: 18px; }
.progression-demo-meta { opacity: 0.65; }
.progression-demo-task { font-style: italic; }
`;
