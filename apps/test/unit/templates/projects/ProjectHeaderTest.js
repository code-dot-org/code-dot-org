import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';

describe('ProjectHeader', () => {
  it('Project count data renders properly in subheading ', () => {
    const wrapper = shallow(
      <ProjectHeader canViewAdvancedTools={true} projectCount={200} />
    );

    expect(wrapper.find(HeaderBanner).props().subHeadingText).toEqual(
      'Over 200 million projects created'
    );
  });
});
