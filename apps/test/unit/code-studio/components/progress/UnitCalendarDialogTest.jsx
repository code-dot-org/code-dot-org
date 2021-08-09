import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import UnitCalendarDialog, {
  WEEK_WIDTH
} from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';
import UnitCalendar from '@cdo/apps/code-studio/components/progress/UnitCalendar';
import {testLessons} from './unitCalendarTestData';

describe('UnitCalendarDialog', () => {
  it('passes the lessons and weekly instructional minutes on to the Unit Calendar', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendar
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).to.be.true;
  });

  it('sets the provided weeklyInstructionalMinutes as default if it is already in the option list', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={45}
      />
    );
    expect(wrapper.find('option').length).to.equal(6);
    expect(
      wrapper.containsMatchingElement(
        <option value={45} key={`minutes-45`}>
          45 minutes
        </option>
      )
    ).to.be.true;
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendar
          lessons={testLessons}
          weeklyInstructionalMinutes={45}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).to.be.true;
  });

  it('adds the provided weeklyInstructionalMinutes to the dropdown and sets it as default', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={20}
      />
    );
    expect(wrapper.find('option').length).to.equal(7);
    expect(
      wrapper.containsMatchingElement(
        <option value={20} key={`minutes-20`}>
          20 minutes
        </option>
      )
    ).to.be.true;
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendar
          lessons={testLessons}
          weeklyInstructionalMinutes={20}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).to.be.true;
  });

  it('changes weeklyInstructionalMinutes when the dropdown value changes', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={45}
      />
    );
    expect(wrapper.state('instructionalMinutes')).to.equal(45);
    wrapper.find('select').simulate('change', {target: {value: 90}});
    expect(wrapper.state('instructionalMinutes')).to.equal(90);
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendar
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).to.be.true;
  });
});
