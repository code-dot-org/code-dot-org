import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';

import {assert} from '../../../util/reconfiguredChai'; //eslint-disable-line no-restricted-imports

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
