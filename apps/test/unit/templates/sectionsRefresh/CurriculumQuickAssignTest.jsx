import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import CurriculumQuickAssign from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import i18n from '@cdo/locale';

window.fetch = jest.fn().mockResolvedValue({json: jest.fn()});

describe('CurriculumQuickAssign', () => {
  it('shows spinner when isLoading is true', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        initialParticipantType="student"
        courseFilters={{}}
        isNewSection={false}
      />
    );

    expect(wrapper.find(Spinner)).toHaveLength(1);
    expect(wrapper.find('h3').length).toBe(1);
    expect(wrapper.find('Button')).toHaveLength(0);
  });

  it('renders headers and the top row of buttons', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    expect(wrapper.find('h3').length).toBe(1);
    expect(wrapper.find('p').length).toBe(1);
    // We haven't specified participantType = student, so all 5 buttons appear
    expect(wrapper.find('Button').length).toBe(5);
    expect(wrapper.find('Button').at(0).props().text).toBe(
      i18n.courseBlocksGradeBandsElementary()
    );
    expect(wrapper.find('Button[id="uitest-high-button"]').props().text).toBe(
      i18n.courseBlocksGradeBandsHigh()
    );
    expect(wrapper.find('input').length).toBe(1);
  });

  it('updates caret direction when clicked', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    expect(wrapper.find('Button').at(0).props().icon).toBe('caret-right');
    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('Button').at(0).props().icon).toBe('caret-down');
  });

  it('opens and closes version dropdowns with table open and collapse', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);
    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);
  });

  it('leaves dropdowns alone when decide later clicked', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    // No dropdowns active at beginning
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Toggle decide later, verify its state changes.
    expect(wrapper.find('input').props().checked).toBe(false);
    wrapper.find('input').simulate('change');
    expect(wrapper.find('input').props().checked).toBe(true);

    // Still no dropdowns active
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Uncheck decide later, still no dropdowns active
    wrapper.find('input').simulate('change');
    expect(wrapper.find('input').props().checked).toBe(false);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Open elementary dropdown
    wrapper
      .find('Button')
      .at(0)
      .simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);

    // Toggle decide later on and off, dropdown remains active
    wrapper.find('input').simulate('change');
    expect(wrapper.find('input').props().checked).toBe(true);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
    wrapper.find('input').simulate('change');
    expect(wrapper.find('input').props().checked).toBe(false);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
  });
});
