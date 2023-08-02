import React from 'react';
import {shallow} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';

import {UnconnectedProjectInfo as ProjectInfo} from '@cdo/apps/code-studio/components/header/ProjectInfo';

import ProjectHeader from '@cdo/apps/code-studio/components/header/ProjectHeader';
import MinimalProjectHeader from '@cdo/apps/code-studio/components/header/MinimalProjectHeader';
import ProjectBackedHeader from '@cdo/apps/code-studio/components/header/ProjectBackedHeader';
import LevelBuilderSaveButton from '@cdo/apps/code-studio/components/header/LevelBuilderSaveButton';

import {possibleHeaders} from '@cdo/apps/code-studio/headerRedux';

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
