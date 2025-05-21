import {render, screen} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import BulkLessonVisibilityToggle from '@cdo/apps/code-studio/components/progress/BulkLessonVisibilityToggle';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {UnconnectedUnitOverviewTopRow as UnitOverviewTopRow} from '@cdo/apps/code-studio/components/progress/UnitOverviewTopRow';
import progress, {initProgress} from '@cdo/apps/code-studio/progressRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {getStore, registerReducers} from '@cdo/apps/redux';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import teacherSections, {
  selectSection,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import * as TeacherNavFlagUtils from '@cdo/apps/templates/teacherNavigation/TeacherNavFlagUtils.ts';
import i18n from '@cdo/locale';

import {testLessons} from './unitCalendarTestData';

const defaultProps = {
  sectionsForDropdown: [],
  scriptId: 42,
  scriptName: 'test-script',
  unitTitle: 'Unit test script title',
  unitAllowsHiddenLessons: true,
  viewAs: ViewType.Participant,
  isRtl: false,
  studentResources: [],
  showAssignButton: true,
  isMigrated: false,
  unitCompleted: false,
  hasPerLevelResults: false,
  publishedState: 'stable',
  isUnitWithLevels: true,
};

const SECTIONS = [
  {
    id: 11,
    name: 'Period 1',
    hidden: false,
    course_id: 1,
    course_offering_id: 11,
    participant_type: 'student',
    code: 'aaa',
  },
  {
    id: 12,
    name: 'Period 2',
    hidden: false,
    course_id: null,
    course_offering_id: null,
    participant_type: 'student',
    code: 'bbb',
  },
];

const STUDENTS = [
  {
    id: 1,
    familyName: 'hill',
    name: 'bobby',
    userType: 'student',
  },
  {
    id: 2,
    familyName: 'morgendorffer',
    name: 'daria',
    userType: 'student',
  },
];

const PROGRESS = {
  currentLevelId: 1,
  currentLessonId: 1,
  lessons: [],
  lessonGroups: [],
};

describe('UnitOverviewTopRow', () => {
  let store;

  beforeEach(() => {
    store = getStore();
    registerReducers({progress, teacherSections});
    store.dispatch(setSections(SECTIONS));
    store.dispatch(selectSection(11));
    store.dispatch(setStudentsForCurrentSection(11, STUDENTS));
    store.dispatch(initProgress(PROGRESS));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders "Try Now" for participant if not unitCompleted and not hasPerLevelResults', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={false}
        hasPerLevelResults={false}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <div>
          <Button
            __useDeprecatedTag
            href="/s/test-script/next"
            text={i18n.tryNow()}
            size={Button.ButtonSize.large}
          />
          <Button
            __useDeprecatedTag
            href="//support.code.org"
            text={i18n.getHelp()}
            color={Button.ButtonColor.white}
            size={Button.ButtonSize.large}
          />
        </div>
      )
    ).toBe(true);
    expect(wrapper.find('Connect(ProgressDetailToggle)')).toHaveLength(1);
  });

  it('does not render "Try Now" if unit has no levels', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow {...defaultProps} isUnitWithLevels={false} />
    );

    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href="/s/test-script/next"
          text={i18n.tryNow()}
          size={Button.ButtonSize.large}
        />
      )
    ).toBe(false);
  });

  it('renders "Continue" for participant if has level results and not unitCompleted', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={false}
        hasPerLevelResults={true}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href="/s/test-script/next"
          text={i18n.continue()}
          size={Button.ButtonSize.large}
        />
      )
    ).toBe(true);
  });

  it('renders "Print Certificate" for participant', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        viewAs={ViewType.Participant}
        unitCompleted={true}
      />
    );

    expect(
      wrapper.containsMatchingElement(
        <Button
          __useDeprecatedTag
          href="/s/test-script/next"
          text={i18n.printCertificate()}
          size={Button.ButtonSize.large}
        />
      )
    ).toBe(true);
  });

  it('renders BulkLessonVisibilityToggle for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow {...defaultProps} viewAs={ViewType.Instructor} />
    );

    expect(
      wrapper.containsMatchingElement(
        <BulkLessonVisibilityToggle
          lessons={defaultProps.unitCalendarLessons}
        />
      )
    ).toBe(true);
  });

  it('renders the unit calendar when showCalendar true for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Instructor}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).toBe(true);
  });

  it('does not render the unit calendar when showCalendar false for instructor', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Instructor}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).toBe(false);
  });

  it('does not render the unit calendar for participant', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        showCalendar
        unitCalendarLessons={testLessons}
        weeklyInstructionalMinutes={90}
        viewAs={ViewType.Participant}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <UnitCalendarButton
          lessons={testLessons}
          weeklyInstructionalMinutes={90}
          scriptId={42}
        />
      )
    ).toBe(false);
  });

  it('does not render printing option dropdown for participants', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.find(DropdownButton).length).toBe(0);
  });

  it('renders RTL without errors', () => {
    expect(() => {
      shallow(<UnitOverviewTopRow {...defaultProps} isRtl={true} />);
    }).not.toThrow();
  });

  it('does not render the printing options drop down if the course is in pilot', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        publishedState="pilot"
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Instructor}
      />
    );
    expect(wrapper.find(DropdownButton).length).toBe(0);
  });

  it('does not render the printing options drop down if the course is in development', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow
        {...defaultProps}
        publishedState="in_development"
        scriptOverviewPdfUrl="/link/to/script_overview.pdf"
        scriptResourcesPdfUrl="/link/to/script_resources.pdf"
        viewAs={ViewType.Instructor}
      />
    );
    expect(wrapper.find(DropdownButton).length).toBe(0);
  });

  it('renders student select dropdown if user is teacher and in teacher-local-nav-v2 experiment', () => {
    jest
      .spyOn(TeacherNavFlagUtils, 'showV2TeacherDashboard')
      .mockImplementation(() => {
        return true;
      });

    render(
      <Provider store={store}>
        <UnitOverviewTopRow
          {...defaultProps}
          publishedState="in_development"
          scriptOverviewPdfUrl="/link/to/script_overview.pdf"
          scriptResourcesPdfUrl="/link/to/script_resources.pdf"
          viewAs={ViewType.Instructor}
        />
      </Provider>
    );
    screen.getByLabelText(i18n.viewingProgressFor());
  });
});
