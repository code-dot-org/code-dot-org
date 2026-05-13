import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
    expect(wrapper.find('MarketingAudienceButton')).toHaveLength(0);
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
    // We haven't specified participantType = student, so all 6 buttons appear
    expect(wrapper.find('MarketingAudienceButton').length).toBe(6);
    expect(wrapper.find('MarketingAudienceButton').at(0).props().text).toBe(
      i18n.courseBlocksGradeBandsElementary()
    );
    expect(wrapper.find('button[id="uitest-high-button"]').text()).toContain(
      i18n.courseBlocksGradeBandsHigh()
    );
    expect(wrapper.find('input[type="checkbox"]').length).toBe(1);
  });

  it('updates caret direction when clicked', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    const elementaryButton = () =>
      wrapper.find('button[id="uitest-elementary-button"]');
    expect(elementaryButton().find(FontAwesomeV6Icon).prop('iconName')).toBe(
      'caret-right'
    );
    elementaryButton().simulate('click', {preventDefault: () => {}});
    expect(elementaryButton().find(FontAwesomeV6Icon).prop('iconName')).toBe(
      'caret-down'
    );
  });

  it('opens and closes version dropdowns with table open and collapse', () => {
    const wrapper = mount(
      <CurriculumQuickAssign
        updateSection={() => {}}
        sectionCourse={{}}
        isNewSection={true}
      />
    );

    const elementaryButton = () =>
      wrapper.find('button[id="uitest-elementary-button"]');

    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);
    elementaryButton().simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
    elementaryButton().simulate('click', {preventDefault: () => {}});
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

    const checkbox = () => wrapper.find('input[type="checkbox"]');
    const elementaryButton = () =>
      wrapper.find('button[id="uitest-elementary-button"]');

    // No dropdowns active at beginning
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Toggle decide later, verify its state changes.
    expect(checkbox().props().checked).toBe(false);
    checkbox().simulate('change');
    expect(checkbox().props().checked).toBe(true);

    // Still no dropdowns active
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Uncheck decide later, still no dropdowns active
    checkbox().simulate('change');
    expect(checkbox().props().checked).toBe(false);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);

    // Open elementary dropdown
    elementaryButton().simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);

    // Toggle decide later on and off, dropdown remains active
    checkbox().simulate('change');
    expect(checkbox().props().checked).toBe(true);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
    checkbox().simulate('change');
    expect(checkbox().props().checked).toBe(false);
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
  });
});
