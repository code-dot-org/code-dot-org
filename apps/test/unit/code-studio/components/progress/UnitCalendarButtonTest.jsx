import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import UnitCalendarDialog from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';

const testLessons = [
  {
    id: 1,
    title: 'Lesson 1',
    duration: 87,
    assessment: true,
    unplugged: false,
    url: 'https://www.google.com/'
  },
  {
    id: 2,
    title: 'Lesson 2',
    duration: 40,
    assessment: false,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 3,
    title: 'Lesson 3',
    duration: 135,
    assessment: true,
    unplugged: true,
    url: 'https://www.google.com/'
  },
  {
    id: 4,
    title: 'Lesson 4',
    duration: 60,
    assessment: false,
    unplugged: false,
    url: 'https://www.google.com/'
  }
];

describe('UnitCalendarButton', () => {
  it('opens UnitCalendarDialog on click', () => {
    const wrapper = shallow(
      <UnitCalendarButton
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
      />
    );
    wrapper.setState({isDialogOpen: true});
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarDialog
          isOpen={true}
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          handleClose={wrapper.closeDialog}
        />
      )
    ).to.be.true;
  });
});
