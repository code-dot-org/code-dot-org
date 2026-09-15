import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TooltipWithIcon from '@cdo/apps/templates/progress/TooltipWithIcon';

const DEFAULT_PROPS = {
  tooltipId: 'id',
  icon: 'desktop',
  text: 'Level Name',
  includeAssessmentIcon: false,
};

describe('TooltipWithIcon', () => {
  it('includes the star icon if level is an assessment', () => {
    const wrapper = shallow(
      <TooltipWithIcon {...DEFAULT_PROPS} includeAssessmentIcon={true} />
    );
    expect(wrapper.find('FontAwesome').first().props().icon).toBe('star');
  });

  it('does not include the star icon if level is not an assessment', () => {
    const wrapper = shallow(<TooltipWithIcon {...DEFAULT_PROPS} />);
    expect(wrapper.find('FontAwesome').first().props().icon).not.toBe('star');
  });
});
