import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React, {act} from 'react';

import Spinner from '@cdo/apps/sharedComponents/Spinner';
import CurriculumQuickAssign from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import i18n from '@cdo/locale';

window.fetch = jest.fn().mockResolvedValue({json: jest.fn()});

// Track mounted trees so each test tears its component down. The component
// fetches on mount; leaving instances mounted lets their pending promises
// resolve during later tests and starve those tests' effect cascades.
let wrappers = [];
const render = props => {
  const wrapper = mount(<CurriculumQuickAssign {...props} />);
  wrappers.push(wrapper);
  return wrapper;
};

afterEach(async () => {
  // Drain each component's pending fetch before unmounting; otherwise the
  // promise resolves during a later test's act flushes and steals its cycles.
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  wrappers.forEach(wrapper => wrapper.unmount());
  wrappers = [];
});

// Drive the fetch -> json -> setState -> filter -> selection cascade to a
// resting point. Each hop is a separate commit whose passive effects flush on
// the next act, so pump act cycles until the predicate holds (or we give up).
const settle = async (wrapper, done) => {
  for (let i = 0; i < 50; i++) {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    wrapper.update();
    if (done()) return;
  }
};

describe('CurriculumQuickAssign', () => {
  it('shows spinner when isLoading is true', () => {
    const wrapper = render({
      updateSection: () => {},
      sectionCourse: {},
      initialParticipantType: 'student',
      isNewSection: false,
    });

    expect(wrapper.find(Spinner)).toHaveLength(1);
    expect(wrapper.find('h3').length).toBe(1);
    expect(wrapper.find('MarketingAudienceButton')).toHaveLength(0);
  });

  it('renders headers and the top row of buttons', () => {
    const wrapper = render({
      updateSection: () => {},
      sectionCourse: {},
      isNewSection: true,
    });

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
    const wrapper = render({
      updateSection: () => {},
      sectionCourse: {},
      isNewSection: true,
    });

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
    const wrapper = render({
      updateSection: () => {},
      sectionCourse: {},
      isNewSection: true,
    });

    const elementaryButton = () =>
      wrapper.find('button[id="uitest-elementary-button"]');

    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);
    elementaryButton().simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(1);
    elementaryButton().simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('VersionUnitDropdowns')).toHaveLength(0);
  });

  it('leaves dropdowns alone when decide later clicked', () => {
    const wrapper = render({
      updateSection: () => {},
      sectionCourse: {},
      isNewSection: true,
    });

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

  // Regression: an existing section's assigned version is not offered in the
  // requested language, but a sibling version keeps the course from being
  // filtered out entirely. The assigned version must still be selectable rather
  // than crashing on a missing course_version lookup.
  it('keeps the assigned version when locale filtering would drop it', async () => {
    // Two versions: 700 is offered in the current locale (en-US) and keeps the
    // course alive; 726 is the section's assigned version, offered only in it-IT.
    const offerings = {
      high: {
        Course: {
          'Year Long': [
            {
              id: 73,
              key: 'csa',
              display_name: 'Computer Science A',
              course_versions: [
                [
                  700,
                  {
                    id: 700,
                    key: '2020',
                    name: 'CSA (en-US)',
                    type: 'UnitGroup',
                    is_stable: true,
                    is_recommended: true,
                    locale_codes: ['en-US'],
                    units: {900: {id: 900, name: 'U1', position: 1}},
                  },
                ],
                [
                  726,
                  {
                    id: 726,
                    key: '2022',
                    name: 'CSA (it-IT)',
                    type: 'UnitGroup',
                    is_stable: true,
                    is_recommended: false,
                    locale_codes: ['it-IT'],
                    units: {
                      3159: {
                        id: 3159,
                        name: 'OOP',
                        position: 1,
                        lesson_extras_available: true,
                        text_to_speech_enabled: true,
                      },
                    },
                  },
                ],
              ],
            },
          ],
        },
      },
    };

    window.fetch = jest
      .fn()
      .mockResolvedValue({json: () => Promise.resolve(offerings)});
    const updateSection = jest.fn();

    let wrapper;
    await act(async () => {
      wrapper = render({
        updateSection,
        sectionCourse: {courseOfferingId: 73, versionId: 726, unitId: 3159},
        initialParticipantType: 'student',
        courseFilters: {currentLocale: true},
        isNewSection: false,
      });
    });
    await settle(wrapper, () => updateSection.mock.calls.length > 0);

    // The component settled instead of crashing on courseVersion.units, and the
    // assigned (out-of-locale) version was selected with its unit metadata.
    expect(wrapper.find(Spinner)).toHaveLength(0);
    expect(updateSection).toHaveBeenCalledWith(
      'course',
      expect.objectContaining({
        courseOfferingId: 73,
        versionId: 726,
        unitId: 3159,
        lessonExtrasAvailable: true,
        textToSpeechEnabled: true,
      })
    );
  });
});
