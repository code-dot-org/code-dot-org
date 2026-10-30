import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import Modal from '@code-dot-org/component-library/modal';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitCalendarDialog, {
  WEEK_WIDTH,
} from '@cdo/apps/code-studio/components/progress/UnitCalendarDialog';
import UnitCalendarGrid from '@cdo/apps/code-studio/components/progress/UnitCalendarGrid';

import {testLessons} from './unitCalendarTestData';

// The dropdown + grid live in Modal's `customContent` prop (a JSX node),
// not as direct children — shallow-render that prop through a wrapping
// fragment so we can query its sub-tree.
const renderContent = wrapper =>
  shallow(<div>{wrapper.find(Modal).prop('customContent')}</div>);

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
      renderContent(wrapper).containsMatchingElement(
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
    const dropdown = renderContent(wrapper).find(SimpleDropdown);
    expect(dropdown.length).toBe(1);
    // Native <select> only roundtrips strings; SimpleDropdown items use string values.
    expect(dropdown.prop('selectedValue')).toBe('45');
    expect(dropdown.prop('items')).toHaveLength(10);
    expect(dropdown.prop('items')).toContainEqual({
      value: '45',
      text: '45 minutes',
    });
    expect(
      renderContent(wrapper).containsMatchingElement(
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
    const dropdown = renderContent(wrapper).find(SimpleDropdown);
    expect(dropdown.prop('selectedValue')).toBe('20');
    expect(dropdown.prop('items')).toHaveLength(11);
    expect(dropdown.prop('items')).toContainEqual({
      value: '20',
      text: '20 minutes',
    });
    expect(
      renderContent(wrapper).containsMatchingElement(
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
    // Invoke SimpleDropdown's onChange directly — shallow render doesn't
    // descend into the component to find the inner <select>.
    renderContent(wrapper).find(SimpleDropdown).prop('onChange')({
      target: {value: '90'},
    });
    expect(wrapper.state('instructionalMinutes')).toBe(90);
    expect(
      renderContent(wrapper).containsMatchingElement(
        <UnitCalendarGrid
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          weekWidth={WEEK_WIDTH}
        />
      )
    ).toBe(true);
  });
});
