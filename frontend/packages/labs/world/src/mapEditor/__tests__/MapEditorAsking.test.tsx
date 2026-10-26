// What the map editor asks the sandbox for, and how often.
//
// It asks for the pictures it has not got. An answer that still lacks one —
// a kind the sandbox cannot picture, as the App's Note records cannot be —
// used to count as a change all the same, so the editor asked again, every
// few hundred milliseconds for as long as the map was open, and the stage
// never sat still long enough to paint the place's own picture
// (specs/SHELL_FINISH_PLAN.md, step 6).

import {act, render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';

/** The heavy half: a canvas, replaced by nothing. */
vi.mock('../MapStage', () => ({
  MapStage: () => <div data-testid="stage" />,
}));

const SOURCE = WORLD_SCENARIOS.simple.source;

vi.mock('@code-dot-org/lab/contexts', () => ({
  useSources: () => ({
    currentSources: {source: SOURCE},
    updateSources: vi.fn(),
    sourcesEpoch: 0,
  }),
  useMaybeLevelProperties: () => undefined,
}));

/** A sandbox that answers every question, and can picture nothing. */
const getActorInfo = vi.fn(async () => ({
  thumbnails: {},
  schemas: {},
  sizes: {},
  scales: {},
  placements: {},
  placementSizes: {},
}));
vi.mock('../../runtime/WorldRuntimeContext', () => ({
  useWorldRuntime: () => ({getActorInfo, hasCompiled: true}),
}));

const {MapEditor} = await import('../MapEditor');

describe('asking the sandbox for pictures', () => {
  it('asks once for what it cannot have, and not again', async () => {
    render(
      <MapEditor
        fileId="2"
        initialContents={projectFiles(SOURCE)['maps/main.map']}
        language="map"
        isReadOnly={false}
        onChange={vi.fn()}
      />,
    );
    await act(() => new Promise(resolve => setTimeout(resolve, 1000)));
    // Once for the kinds and once for the placements; an answer that adds
    // nothing changes nothing, so neither effect runs again.
    expect(getActorInfo.mock.calls.length).toBeGreaterThan(0);
    expect(getActorInfo.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
