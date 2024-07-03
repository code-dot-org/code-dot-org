import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import SingleSectionSetUp from '@cdo/apps/templates/sectionsRefresh/SingleSectionSetUp';

describe('SingleSectionSetUp', () => {
  it('calls updateSection when name is updated', () => {
    const updateSectionSpy = jest.fn();
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={updateSectionSpy}
        isNewSection={true}
      />
    );

    wrapper
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'Section 1'}});
    expect(updateSectionSpy).toHaveBeenCalledTimes(1);
  });

  it('renders Chips with expected props', () => {
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: 'student'}}
        updateSection={() => {}}
        isNewSection={false}
      />
    );

    const chips = wrapper.find('Chips');
    expect(chips.length).toBe(1);
    expect(chips.prop('name')).toBe('grades');
    expect(chips.prop('required')).toBe(true);
    expect(chips.prop('options').length).toBe(14); // K + 12 + Other
    expect(chips.prop('values')).toEqual([]);
  });

  it('does not render grade selector when participantType is teacher', () => {
    const wrapper = shallow(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: ParticipantAudience.teacher}}
        updateSection={() => {}}
        isNewSection={false}
      />
    );

    expect(wrapper.find('Chips').length).toBe(0);
  });

  it('calls updateSection when grade selection is updated', () => {
    const updateSectionSpy = jest.fn();
    const wrapper = mount(
      <SingleSectionSetUp
        sectionNum={1}
        section={{participantType: ParticipantAudience.student}}
        updateSection={updateSectionSpy}
        isNewSection={false}
      />
    );

    const checkbox = wrapper.find('input[type="checkbox"]').at(0);
    checkbox.simulate('change', {
      target: {setCustomValidity: () => {}, checked: true},
    });
    expect(updateSectionSpy).toHaveBeenCalledTimes(1);
  });
});
