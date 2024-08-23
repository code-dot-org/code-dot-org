import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MinimalProjectHeader from '@cdo/apps/code-studio/components/header/MinimalProjectHeader';
import ProjectBackedHeader from '@cdo/apps/code-studio/components/header/ProjectBackedHeader';
import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';
import {UnconnectedProjectInfo as ProjectInfo} from '@cdo/apps/code-studio/components/header/ProjectInfo';
import {possibleHeaders} from '@cdo/apps/code-studio/headerRedux';

// TODO: These components have circular dependencies which causes the component to mount as undefined randomly
// Mock out to break the circularity until we can untangle them
jest.mock('@cdo/apps/code-studio/components/header/ProjectBackedHeader');
jest.mock('@cdo/apps/code-studio/components/header/MinimalProjectHeader');
jest.mock('@cdo/apps/code-studio/components/header/ProjectHeader');

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
    };

    Object.entries(headerComponents).forEach(([currentHeader, component]) => {
      console.log(currentHeader);
      const wrapper = shallow(<ProjectInfo currentHeader={currentHeader} />);
      expect(wrapper.find(component)).toHaveLength(1);
    });
  });
});
