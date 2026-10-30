import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';

describe('SummaryTeacherInstructions', () => {
  it('renders teacher markdown if defined', () => {
    const wrapper = mount(
      <SummaryTeacherInstructions
        scriptData={{teacher_markdown: 'test teacher markdown'}}
      />
    );

    expect(wrapper.find('SafeMarkdown').length).toBe(1);
    expect(wrapper.find('SafeMarkdown').at(0).text()).toBe(
      'test teacher markdown'
    );
  });
});
