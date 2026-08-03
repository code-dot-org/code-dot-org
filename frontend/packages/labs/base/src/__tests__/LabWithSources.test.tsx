// Where a lab's sources come from.
//
// The project the level load fetched reaches the sources context two ways: an
// event (`LevelLoadCompleted`), which only a provider that is already mounted
// can hear, and redux, which is a value and does not care when anyone mounted.
// Reading the value is what makes a lab that renders AFTER the load correct —
// before this, such a lab sat on the level's start sources with the learner's
// saved project nowhere in sight.

import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {ProjectSources} from '../projects';

const SAVED: ProjectSources = {source: 'the saved project'};

let providerProps: Record<string, unknown> = {};
vi.mock('../contexts/SourcesContext', () => ({
  SourcesProvider: (props: Record<string, unknown>) => {
    providerProps = props;
    return <div data-testid="provider" />;
  },
}));
vi.mock('../contexts/ProjectContext', () => ({
  ProjectProvider: ({children}: {children?: React.ReactNode}) => children,
}));
vi.mock('../contexts/LevelPropertiesContext', () => ({
  useMaybeLevelProperties: () => ({id: 1, appName: 'world'}),
}));

let storedSources: ProjectSources | undefined;
vi.mock('../redux', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({lab: {initialSources: storedSources}}),
}));

const {default: LabWithSources} = await import('../components/LabWithSources');

const renderLab = () =>
  render(
    <LabWithSources defaultSources={{source: 'the start sources'}}>
      <div />
    </LabWithSources>,
  );

describe('LabWithSources', () => {
  it('hands the loaded project to the sources provider', () => {
    storedSources = SAVED;

    renderLab();

    expect(screen.getByTestId('provider')).toBeInTheDocument();
    // `getInitialSources` prefers this over the level's template/start sources,
    // and the provider reinitializes when it arrives — so this covers a lab
    // that mounted before the load and one that mounted after it.
    expect(providerProps.initialSources).toEqual(SAVED);
  });

  it('passes nothing when there is no project yet', () => {
    // A level with no project, or a load still in flight: the provider falls
    // back to the level's own sources, as it always did.
    storedSources = undefined;

    renderLab();

    expect(providerProps.initialSources).toBeUndefined();
    expect(providerProps.defaultSources).toEqual({
      source: 'the start sources',
    });
  });
});
