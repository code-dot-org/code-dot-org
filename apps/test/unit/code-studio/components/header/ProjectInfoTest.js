import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LevelBuilderSaveButton from '@cdo/apps/code-studio/components/header/LevelBuilderSaveButton';
import measureRenderedWidth from '@cdo/apps/code-studio/components/header/measureRenderedWidth';
import MinimalProjectHeader from '@cdo/apps/code-studio/components/header/MinimalProjectHeader';
import ProjectBackedHeader from '@cdo/apps/code-studio/components/header/ProjectBackedHeader';
import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';
import {UnconnectedProjectInfo as ProjectInfo} from '@cdo/apps/code-studio/components/header/ProjectInfo';
import {possibleHeaders} from '@cdo/apps/code-studio/headerRedux';

// TODO: These components have circular dependencies which causes the component to mount as undefined randomly
// Mock out to break the circularity until we can untangle them
jest.mock('@cdo/apps/code-studio/components/header/LevelBuilderSaveButton');
jest.mock('@cdo/apps/code-studio/components/header/ProjectBackedHeader');
jest.mock('@cdo/apps/code-studio/components/header/MinimalProjectHeader');
jest.mock('@cdo/apps/code-studio/components/header/ProjectHeader');
jest.mock('@cdo/apps/code-studio/components/header/measureRenderedWidth');

describe('ProjectInfo', () => {
  it('renders nothing by default', () => {
    const wrapper = shallow(<ProjectInfo />);
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('renders the appropriate header component when specified', () => {
    const headerComponents = {
      [possibleHeaders.project]: ProjectHeader,
      [possibleHeaders.minimalProject]: MinimalProjectHeader,
      [possibleHeaders.projectBacked]: ProjectBackedHeader,
      [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton,
    };

    Object.entries(headerComponents).forEach(([currentHeader, component]) => {
      console.log(currentHeader);
      const wrapper = shallow(<ProjectInfo currentHeader={currentHeader} />);
      expect(wrapper.find(component)).toHaveLength(1);
    });
  });

  // The parent reserves whole pixels and clips to the reported width, and the
  // trailing Remix button's 1px border sits flush against that edge. Reporting
  // even a fraction of a pixel short clips the border away.
  describe('reported desired width', () => {
    [277.453, 279.219, 300.5, 300.999, 42].forEach(measured => {
      it(`is never narrower than a measured ${measured}px`, () => {
        measureRenderedWidth.mockReturnValue(measured);
        const setDesiredWidth = jest.fn();

        shallow(
          <ProjectInfo
            currentHeader={possibleHeaders.project}
            setDesiredWidth={setDesiredWidth}
          />
        );

        expect(setDesiredWidth).toHaveBeenCalledWith(Math.ceil(measured));
        expect(setDesiredWidth.mock.calls[0][0]).toBeGreaterThanOrEqual(
          measured
        );
      });
    });

    it('reserves no more than a pixel beyond the measurement, since surplus is taken from the rest of the header row', () => {
      measureRenderedWidth.mockReturnValue(277.453);
      const setDesiredWidth = jest.fn();

      shallow(
        <ProjectInfo
          currentHeader={possibleHeaders.project}
          setDesiredWidth={setDesiredWidth}
        />
      );

      expect(setDesiredWidth.mock.calls[0][0] - 277.453).toBeLessThan(1);
    });
  });
});
