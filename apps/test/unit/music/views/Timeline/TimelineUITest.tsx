import {render} from '@testing-library/react';
import React from 'react';

import {BlockMode} from '@cdo/apps/music/constants';
import TimelineUI from '@cdo/apps/music/views/Timeline/TimelineUI';
import {RootState} from '@cdo/apps/types/redux';

const mockUseSelector = jest.fn();
const mockUseDispatch = jest.fn();

jest.mock('react-redux', () => ({
  Provider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useSelector: (selector: (state: RootState) => unknown) =>
    mockUseSelector(selector),
  useDispatch: () => mockUseDispatch,
}));

describe('TimelineUI', () => {
  beforeAll(() => {
    // Need to mock scrollIntoView since it's not implemented in JSDOM
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    mockUseSelector.mockClear();
    mockUseDispatch.mockClear();
  });

  it('should not directly access redux', () => {
    const mockProps = {
      playbackEvents: [
        {
          id: '1',
          type: 'sound',
          when: 1,
          triggered: false,
          length: 2,
          blockId: 'block1',
          soundType: 'lead',
        } as const,
      ],
      orderedFunctions: [],
      isPlaying: false,
      blockMode: BlockMode.SIMPLE2,
      currentPlayheadPosition: 1,
    };

    render(<TimelineUI {...mockProps} />);

    expect(mockUseSelector).not.toHaveBeenCalled();
    expect(mockUseDispatch).not.toHaveBeenCalled();
  });
});
