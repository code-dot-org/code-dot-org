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

const level = (id: number, usesProjects = true): AilabLevelProperties => ({
  id,
  name: `level ${id}`,
  appName: 'ailab',
  usesProjects,
});

function useSourcesReturns(loaded: boolean) {
  mockedUseSources.mockReturnValue({
    currentSources: loaded ? {source: ''} : undefined,
    projectManager: null,
  } as unknown as ReturnType<typeof useSources>);
}

describe('AilabContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading until the project loads', () => {
    useSourcesReturns(false);
    render(<AilabContainer levelProperties={level(1)} />);

    expect(Loading).toHaveBeenCalled();
    expect(mockedView).not.toHaveBeenCalled();
  });

  it('shows the lab once the project loads', () => {
    useSourcesReturns(true);
    render(<AilabContainer levelProperties={level(1)} />);

    expect(mockedView.mock.lastCall?.[0]).toMatchObject({
      levelProperties: level(1),
    });
  });

  it('shows the lab at once on a level that keeps no project', () => {
    useSourcesReturns(false);
    render(<AilabContainer levelProperties={level(1, false)} />);

    expect(mockedView).toHaveBeenCalled();
  });
});
