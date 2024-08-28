import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import UnitCalendarDialog from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';

import {testLessons} from './unitCalendarTestData';

describe('UnitCalendarButton', () => {
  it('opens UnitCalendarDialog on click', () => {
    const wrapper = shallow(
      <UnitCalendarButton
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
        scriptId={1}
      />
    );

    wrapper.find('Button').simulate('click');
    expect(wrapper.state('isDialogOpen')).toBe(true);
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarDialog
          isOpen={true}
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          handleClose={wrapper.instance().closeDialog}
          scriptId={1}
        />
      )
    ).toBe(true);
  });
});
