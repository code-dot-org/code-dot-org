import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
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
    expect(wrapper.state('isDialogOpen')).to.be.true;
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarDialog
          isOpen={true}
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          handleClose={wrapper.instance().closeDialog}
        />
      )
    ).to.be.true;
  });
});
