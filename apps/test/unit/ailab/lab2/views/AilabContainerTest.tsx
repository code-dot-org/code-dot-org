import type {AilabSnapshot} from '@code-dot-org/ailab';
import {render} from '@testing-library/react';
import React from 'react';

import {AilabLevelProperties} from '@cdo/apps/ailab/lab2/types';
import AilabContainer from '@cdo/apps/ailab/lab2/views/AilabContainer';
import AilabView from '@cdo/apps/ailab/lab2/views/AilabView';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import Loading from '@cdo/apps/lab2/views/Loading';

jest.mock('@cdo/apps/ailab/lab2/views/AilabView', () => jest.fn(() => null));
jest.mock('@cdo/apps/lab2/views/Loading', () => jest.fn(() => null));
jest.mock('@cdo/apps/lab2/hooks/useSources', () => jest.fn());
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppDispatch: () => jest.fn(),
}));

const mockedUseSources = jest.mocked(useSources);
const mockedView = jest.mocked(AilabView);
const updateSources = jest.fn();

const level = (id: number, usesProjects = true): AilabLevelProperties => ({
  id,
  name: `level ${id}`,
  appName: 'ailab',
  usesProjects,
});

const snapshotFor = (datasetId: string) =>
  ({datasetId, labelColumn: 'animal'} as unknown as AilabSnapshot);

function useSourcesReturns(snapshot: AilabSnapshot | undefined | null) {
  mockedUseSources.mockReturnValue({
    currentSources:
      snapshot === null
        ? undefined
        : {source: snapshot ? JSON.stringify(snapshot) : ''},
    projectManager: null,
    updateSources,
  } as unknown as ReturnType<typeof useSources>);
}

const lastViewProps = () => mockedView.mock.lastCall?.[0];

describe('AilabContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading until the saved work arrives', () => {
    useSourcesReturns(null);
    render(<AilabContainer levelProperties={level(1)} />);

    expect(Loading).toHaveBeenCalled();
    expect(mockedView).not.toHaveBeenCalled();
  });

  it('passes the saved work to the lab', () => {
    useSourcesReturns(null);
    const {rerender} = render(<AilabContainer levelProperties={level(1)} />);

    useSourcesReturns(snapshotFor('zoo'));
    rerender(<AilabContainer levelProperties={level(1)} />);

    expect(lastViewProps()?.initialSnapshot).toEqual(snapshotFor('zoo'));
  });

  it('starts a level with no saved work empty', () => {
    useSourcesReturns(null);
    const {rerender} = render(<AilabContainer levelProperties={level(1)} />);

    useSourcesReturns(undefined);
    rerender(<AilabContainer levelProperties={level(1)} />);

    expect(lastViewProps()).toMatchObject({initialSnapshot: undefined});
  });

  it("does not give a new level the previous level's work", () => {
    useSourcesReturns(null);
    const {rerender} = render(<AilabContainer levelProperties={level(1)} />);
    useSourcesReturns(snapshotFor('first'));
    rerender(<AilabContainer levelProperties={level(1)} />);
    mockedView.mockClear();

    rerender(<AilabContainer levelProperties={level(2)} />);
    expect(mockedView).not.toHaveBeenCalled();

    useSourcesReturns(null);
    rerender(<AilabContainer levelProperties={level(2)} />);
    useSourcesReturns(snapshotFor('second'));
    rerender(<AilabContainer levelProperties={level(2)} />);

    expect(lastViewProps()?.initialSnapshot).toEqual(snapshotFor('second'));
  });

  it('saves changes as project sources', () => {
    useSourcesReturns(null);
    const {rerender} = render(<AilabContainer levelProperties={level(1)} />);
    useSourcesReturns(undefined);
    rerender(<AilabContainer levelProperties={level(1)} />);

    lastViewProps()?.onStateChange?.(snapshotFor('zoo'));

    expect(updateSources).toHaveBeenCalledWith({
      source: JSON.stringify(snapshotFor('zoo')),
    });
  });

  it('runs without saving on a level that keeps no project', () => {
    useSourcesReturns(null);
    render(<AilabContainer levelProperties={level(1, false)} />);

    expect(lastViewProps()).toMatchObject({
      initialSnapshot: undefined,
      onStateChange: undefined,
    });
  });
});
