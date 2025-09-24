import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ParticipantAudience} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import SingleSectionSetUp from '@cdo/apps/templates/sectionsRefresh/SingleSectionSetUp';

describe('SingleSectionSetUp', () => {
  const renderComponent = (
    updateSection = () => {},
    batchUpdateSection = () => {}
  ) => {
    return render(
      <SingleSectionSetUp
        sectionNum={1}
        section={{}}
        updateSection={updateSection}
        batchUpdateSection={batchUpdateSection}
        isNewSection={false}
        isLoading={false}
      />
    );
  };

  let updateSectionSpy;
  let batchUpdateSectionSpy;

  beforeEach(() => {
    updateSectionSpy = jest.fn();
    batchUpdateSectionSpy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it('renders section avatar and button when teacher-homepage-v2 experiment is enabled', () => {
    renderComponent();
    screen.getByText('Avatar');
    screen.getByText('Edit avatar');
  });

  it('displays avatar edit dialog when Edit Avatar is clicked', () => {
    renderComponent();
    const dialogButton = screen.getByText('Edit avatar');
    fireEvent.click(dialogButton);
    screen.getByText('Choose an emoji');
    screen.getByText('Choose a background color');
  });

  it('calls batchUpdateSection when avatar is updated', () => {
    renderComponent(updateSectionSpy, batchUpdateSectionSpy);
    const dialogButton = screen.getByText('Edit avatar');
    fireEvent.click(dialogButton);
    const avatarSelectButton = screen.getByText('Select avatar');
    fireEvent.click(avatarSelectButton);
    expect(batchUpdateSectionSpy).toHaveBeenCalled();
  });
});
