import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/deprecatedChai';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

describe('ProjectHeader', () => {
  it('Project count data renders properly in subheading ', () => {
    const wrapper = shallow(
      <ProjectHeader canViewAdvancedTools={true} projectCount={10000000} />
    );

    // Expect the number to be formatted to the appropriate client locale
    // (which can change depending on the browser running this test)
    const localeFormattedCount = Number(10000000).toLocaleString();

    assert.equal(
      wrapper.find(HeaderBanner).props().subHeadingText,
      `${localeFormattedCount} projects created`
    );
  });
});
