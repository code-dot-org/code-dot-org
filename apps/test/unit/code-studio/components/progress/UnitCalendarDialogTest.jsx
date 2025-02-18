import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitCalendarDialog, {
  WEEK_WIDTH,
} from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';
import UnitCalendarGrid from '@cdo/apps/code-studio/components/progress/UnitCalendarGrid';

import {testLessons} from './unitCalendarTestData';

describe('UnitCalendarDialog', () => {
  it('passes the lessons and weekly instructional minutes on to the Unit Calendar', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={90}
        scriptId={123}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarGrid
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).toBe(true);
  });

  it('sets the provided weeklyInstructionalMinutes as default if it is already in the option list', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={45}
        scriptId={123}
      />
    );
    expect(wrapper.find('option').length).toBe(10);
    expect(
      wrapper.containsMatchingElement(
        <option value={45} key={`minutes-45`}>
          45 minutes
        </option>
      )
    ).toBe(true);
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarGrid
          lessons={testLessons}
          weeklyInstructionalMinutes={45}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).toBe(true);
  });

  it('adds the provided weeklyInstructionalMinutes to the dropdown and sets it as default', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={20}
        scriptId={123}
      />
    );
    expect(wrapper.find('option').length).toBe(11);
    expect(
      wrapper.containsMatchingElement(
        <option value={20} key={`minutes-20`}>
          20 minutes
        </option>
      )
    ).toBe(true);
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarGrid
          lessons={testLessons}
          weeklyInstructionalMinutes={20}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).toBe(true);
  });

  it('changes weeklyInstructionalMinutes when the dropdown value changes', () => {
    const wrapper = shallow(
      <UnitCalendarDialog
        isOpen
        handleClose={() => console.log('hello')}
        lessons={testLessons}
        weeklyInstructionalMinutes={45}
        scriptId={123}
      />
    );
    expect(wrapper.state('instructionalMinutes')).toBe(45);
    wrapper.find('select').simulate('change', {target: {value: 90}});
    expect(wrapper.state('instructionalMinutes')).toBe(90);
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarGrid
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).toBe(true);
  });
});
