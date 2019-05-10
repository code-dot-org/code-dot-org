import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

describe('ProjectHeader', () => {
  it('Project count data renders properly in subheading ', () => {
    const wrapper = shallow(
      <ProjectHeader canViewAdvancedTools={true} projectCount={10000000} />
    );

    // Note because we don't have a locale in the test we get an unformatted number
    // Example 10000000 instead of 10,000,000
    assert.equal(
      wrapper.find(HeaderBanner).props().subHeadingText,
      '10000000 projects created'
    );
  });
});
