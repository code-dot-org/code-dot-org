import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LevelBuilderSaveButton from '@cdo/apps/code-studio/components/header/LevelBuilderSaveButton';
import MinimalProjectHeader from '@cdo/apps/code-studio/components/header/MinimalProjectHeader';
import ProjectBackedHeader from '@cdo/apps/code-studio/components/header/ProjectBackedHeader';
import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';
import {UnconnectedProjectInfo as ProjectInfo} from '@cdo/apps/code-studio/components/header/ProjectInfo';
import {possibleHeaders} from '@cdo/apps/code-studio/headerRedux';

import {expect} from '../../../../util/reconfiguredChai';

describe('ProjectInfo', () => {
  it('renders nothing by default', () => {
    const wrapper = shallow(<ProjectInfo />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('renders the appropriate header component when specified', () => {
    const headerComponents = {
      [possibleHeaders.project]: ProjectHeader,
      [possibleHeaders.minimalProject]: MinimalProjectHeader,
      [possibleHeaders.projectBacked]: ProjectBackedHeader,
      [possibleHeaders.levelBuilderSave]: LevelBuilderSaveButton,
    };

    Object.entries(headerComponents).forEach(([currentHeader, component]) => {
      const wrapper = shallow(<ProjectInfo currentHeader={currentHeader} />);
      expect(wrapper.find(component)).to.have.lengthOf(1);
    });
  });
});
