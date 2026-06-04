import {Button as MuiButton} from '@mui/material';
import {render, screen} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import BulkLessonVisibilityToggle from '@cdo/apps/code-studio/components/progress/BulkLessonVisibilityToggle';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {UnconnectedUnitOverviewTopRow as UnitOverviewTopRow} from '@cdo/apps/code-studio/components/progress/UnitOverviewTopRow';
import progress, {initProgress} from '@cdo/apps/code-studio/progressRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teacherSections, {
  selectSection,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {testLessons} from './unitCalendarTestData';

const defaultProps = {
  sectionsForDropdown: [],
  scriptId: 42,
  scriptName: 'test-script',
  scriptPath: '/courses/test-course/units/1',
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

  // Buttons are MUI Buttons with text as children — find by href + the rendered
  // text, since enzyme's shallow render keeps the children prop accessible.
  const findButtonByHref = (wrapper, href, text) =>
    wrapper
      .find(MuiButton)
      .filterWhere(b => b.prop('href') === href && b.prop('children') === text);

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
      findButtonByHref(
        wrapper,
        '/courses/test-course/units/1/next',
        i18n.tryNow()
      ).length
    ).toBe(1);
    expect(
      findButtonByHref(wrapper, '//support.code.org', i18n.getHelp()).length
    ).toBe(1);
    expect(wrapper.find('Connect(ProgressDetailToggle)')).toHaveLength(1);
  });

  it('does not render "Try Now" if unit has no levels', () => {
    const wrapper = shallow(
      <UnitOverviewTopRow {...defaultProps} isUnitWithLevels={false} />
    );
    expect(
      findButtonByHref(
        wrapper,
        '/courses/test-course/units/1/next',
        i18n.tryNow()
      ).length
    ).toBe(0);
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
      findButtonByHref(
        wrapper,
        '/courses/test-course/units/1/next',
        i18n.continue()
      ).length
    ).toBe(1);
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
      findButtonByHref(
        wrapper,
        '/courses/test-course/units/1/next',
        i18n.printCertificate()
      ).length
    ).toBe(1);
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
    // Printing options dropdown moved to UnitOverviewActionRow; this row
    // no longer renders it at all.
    expect(wrapper.find('ActionDropdown').length).toBe(0);
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
    // Printing options dropdown moved to UnitOverviewActionRow; this row
    // no longer renders it at all.
    expect(wrapper.find('ActionDropdown').length).toBe(0);
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
    // Printing options dropdown moved to UnitOverviewActionRow; this row
    // no longer renders it at all.
    expect(wrapper.find('ActionDropdown').length).toBe(0);
  });

  it('renders student select dropdown if user is teacher', () => {
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
