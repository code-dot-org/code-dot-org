import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

describe('ProjectHeader', () => {
  it('Project count data renders properly in subheading ', () => {
    const wrapper = shallow(
      <ProjectHeader canViewAdvancedTools={true} projectCount={200} />
    );

    assert.equal(
      wrapper.find(HeaderBanner).props().subHeadingText,
      'Over 200 million projects created'
    );
  });
});
