import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/levelbuilder/lesson-editor/resourcesEditorRedux';
import UnitEditor from '@cdo/apps/levelbuilder/unit-editor/UnitEditor';
import reducers, {
  init,
} from '@cdo/apps/levelbuilder/unit-editor/unitEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';
import {navigateToHref} from '@cdo/apps/utils';

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  navigateToHref: jest.fn(),
}));

describe('UnitEditor', () => {
  let defaultProps, store;

  beforeEach(() => {
    stubRedux();

    registerReducers({
      ...reducers,
      isRtl,
      resources: createResourcesReducer('teacherResource'),
      studentResources: createResourcesReducer('studentResource'),
    });
    store = getStore();
    store.dispatch(
      init([
        {
          bigQuestions: '* One↵* two',
          description: 'laklkldkla"',
          displayName: 'Content',
          key: 'lesson group',
          lessons: [],
          position: 1,
          userFacing: true,
        },
      ])
    );
    store.dispatch(initResources([]));

    defaultProps = {
      id: 1,
      initialAnnouncements: [],
      curriculumUmbrella: 'CSF',
      i18nData: {
        description:
          '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
        studentDescription:
          '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
      },
      isLevelbuilder: true,
      locales: [],
      name: 'test-unit',
      unitFamilies: [],
      initialProjectSharing: false,
      initialLocales: [],
      isMigrated: false,
      initialPublishedState: PublishedState.in_development,
      initialHideWithinCourse: false,
      initialSupportedLocales: [],
      initialTopicTags: [],
      hasCourse: false,
      scriptPath: '/s/test-unit',
      initialProfessionalLearningCourse: '',
      isCSDCourseOffering: false,
      isMissingRequiredDeviceCompatibilities: false,
    };
  });

  afterEach(() => {
    restoreRedux();
    navigateToHref.mockReset();
  });

  function renderDefault(overrideProps = {}) {
    const combinedProps = {...defaultProps, ...overrideProps};
    render(
      <Provider store={store}>
        <UnitEditor {...combinedProps} />
      </Provider>
    );
  }

  describe('Script Editor', () => {
    it('does not show publishing editor if hasCourse is true', () => {
      renderDefault({hasCourse: true});
      expect(screen.queryByText('Course Version')).not.toBeInTheDocument();
    });

    it('shows publishing editor if hasCourse is false', () => {
      renderDefault({hasCourse: false});
      screen.getByText('Publishing Settings');
    });

    it('topic tags is a multiple chips component with initial options selected', () => {
      renderDefault({initialTopicTags: ['music_lab', 'ai']});

      expect(screen.getByLabelText('Music lab')).toBeChecked();
      expect(screen.getByLabelText('AI')).toBeChecked();
      expect(
        screen.getAllByRole('checkbox').filter(c => c.name && c.checked)
      ).toHaveLength(2);
      expect(screen.getAllByRole('checkbox').filter(c => c.name)).toHaveLength(
        5
      );
    });

    it('selecting topic tag chips updates input element selection state', () => {
      renderDefault({initialTopicTags: ['music_lab', 'ai']});

      expect(screen.getByLabelText('Maker')).not.toBeChecked();

      fireEvent.click(screen.getByLabelText('Maker'));

      expect(screen.getByLabelText('Maker')).toBeChecked();
    });

    it('content area is a drop down selector with initial option selected', () => {
      renderDefault({initialContentArea: 'self_paced_pl_k_5'});

      const contentArea = screen.getByLabelText('Content Area');
      expect(within(contentArea).getAllByRole('option')).toHaveLength(12);
      expect(within(contentArea).getByText('K-5 self-paced PL').selected).toBe(
        true
      );
    });

    it('shows hide this unit in course if hasCourse and course is not in development', () => {
      renderDefault({
        hasCourse: true,
        initialPublishedState: 'pilot',
      });
      screen.getByLabelText(/Hide this unit within this course/i);
    });

    it('does not show hide this unit in course if does not have course', () => {
      renderDefault({
        hasCourse: false,
        initialPublishedState: 'pilot',
      });
      expect(
        screen.queryByLabelText(/Hide this unit within this course/i)
      ).not.toBeInTheDocument();
    });

    it('does not show hide this unit in course if course is in development', () => {
      renderDefault({
        hasCourse: true,
        initialPublishedState: 'in_development',
      });
      expect(
        screen.queryByLabelText(/Hide this unit within this course/i)
      ).not.toBeInTheDocument();
    });

    it('clicking hide unit checkbox updates checkbox state', () => {
      renderDefault({
        hasCourse: true,
        initialPublishedState: 'stable',
        initialHideWithinCourse: true,
      });
      const checkbox = screen.getByLabelText(
        /Hide this unit within this course/i
      );
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);

      expect(checkbox).not.toBeChecked();
    });

    it('uses new unit editor for migrated unit', () => {
      renderDefault({
        isMigrated: true,
        initialCourseVersionId: 1,
      });

      // Verify all 10 CollapsibleEditorSections are present with h2 titles
      const expectedSections = [
        'Overviews',
        'Basic Settings',
        'Supported locales',
        'Publishing Settings',
        'Announcements',
        'Lesson Settings',
        'Resources Dropdowns',
        'Unit Calendar Settings',
        'Deeper Learning Settings',
        'Lesson Groups and Lessons',
      ];
      const sectionHeadings = screen.getAllByRole('heading', {level: 2});
      const sectionTitles = sectionHeadings.map(h => h.textContent);
      expectedSections.forEach(title => {
        expect(sectionTitles).toContain(title);
      });
      expect(sectionHeadings).toHaveLength(10);

      // SaveBar buttons exist
      screen.getByRole('button', {name: 'Save and Keep Editing'});
      screen.getByRole('button', {name: 'Save and Close'});

      // CourseTypeEditor is not rendered for migrated units
      expect(
        screen.queryByText('Course Type Settings')
      ).not.toBeInTheDocument();

      // UnitCard content exists
      screen.getByText('Unit');
    });

    it('locale selection is a multi select checkbox component with initial options selected', () => {
      renderDefault({
        initialLocales: [
          ['Hindi', 'hi-IN'],
          ['Tamil', 'ta-IN'],
          ['Kannada', 'ka-IN'],
          ['Bahasa', 'ms-MY'],
        ],
        initialSupportedLocales: ['hi-IN', 'ta-IN'],
      });

      fireEvent.click(screen.getByText('Supported locales'));

      screen.getByText('hi-IN');
      screen.getByText('ta-IN');
      screen.getByText('ka-IN');
      screen.getByText('ms-MY');
    });

    it('disables changing student facing lesson plan checkbox when not allowed to make major curriculum changes', () => {
      renderDefault({
        allowMajorCurriculumChanges: false,
        isMigrated: true,
        initialUseLegacyLessonPlans: false,
      });

      const checkbox = screen.getByLabelText(
        /Include student-facing lesson plans/i
      );
      expect(checkbox).toBeDisabled();
    });

    it('allows changing student facing lesson plan checkbox when allowed to make major curriculum changes to hidden unit', () => {
      renderDefault({
        allowMajorCurriculumChanges: true,
        isMigrated: true,
        initialUseLegacyLessonPlans: false,
      });

      const checkbox = screen.getByLabelText(
        /Include student-facing lesson plans/i
      );
      expect(checkbox).not.toBeDisabled();
    });

    describe('Teacher Resources', () => {
      it('uses new resource editor for migrated units', () => {
        renderDefault({
          isMigrated: true,
        });

        screen.getByText('Resources Dropdowns');
      });
    });

    it('has correct markdown for preview of unit description', () => {
      renderDefault({});

      screen.getByText('Teacher Overview');
      screen.getByText('Student Overview');

      screen.getByText('TEACHER Title');
      screen.getByText('STUDENT Title');
    });
  });

  it('disables peer review count when instructor review only selected', () => {
    renderDefault({
      initialOnlyInstructorReviewRequired: false,
      initialPeerReviewsRequired: 2,
    });

    const peerReviewCountInput = screen.getByLabelText(
      /Number of Peer Reviews to Complete/i
    );
    const instructorReviewOnlyCheckbox = screen.getByLabelText(
      /Only Require Review from Instructor/i
    );

    expect(peerReviewCountInput).not.toBeDisabled();
    expect(peerReviewCountInput).toHaveValue('2');

    fireEvent.click(instructorReviewOnlyCheckbox);

    expect(peerReviewCountInput).toBeDisabled();
    expect(peerReviewCountInput).toHaveValue('0');
  });

  describe('Saving Script Editor', () => {
    let ajaxSpy;

    afterEach(() => {
      if (ajaxSpy) {
        ajaxSpy.mockRestore();
      }
    });

    function mockAjax() {
      const deferred = $.Deferred();
      ajaxSpy = jest.spyOn($, 'ajax').mockReturnValue(deferred);
      return deferred;
    }

    it('can save and keep editing', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();
      expect(screen.queryByText(/Last saved at:/)).not.toBeInTheDocument();

      deferred.resolve({scriptPath: '/s/test-unit'});

      await waitFor(() => {
        screen.getByText(/Last saved at:/);
      });

      expect(document.querySelector('.fa-spinner')).not.toBeInTheDocument();
      expect(navigateToHref).not.toHaveBeenCalled();
    });

    it('shows error when save and keep editing has error saving', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();

      deferred.reject({status: 404, responseText: 'There was an error'});

      await waitFor(() => {
        screen.getByText('Error Saving: There was an error');
      });

      expect(document.querySelector('.fa-spinner')).not.toBeInTheDocument();
      expect(navigateToHref).not.toHaveBeenCalled();
    });

    it('Timeout error shows custom error message to refresh and check it saved', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();

      deferred.reject({status: 504, responseText: 'Error: Gateway Timeout'});

      await waitFor(() => {
        screen.getByText(
          /Error Saving: The save request timed out. Please refresh the page and verify your changes have been saved correctly./
        );
      });

      expect(document.querySelector('.fa-spinner')).not.toBeInTheDocument();
      expect(navigateToHref).not.toHaveBeenCalled();
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes not provided', () => {
      ajaxSpy = jest.spyOn($, 'ajax');
      renderDefault({initialShowCalendar: true});

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(ajaxSpy).not.toHaveBeenCalled();

      screen.getByText(
        'Error Saving: Please provide instructional minutes per week in Unit Calendar Settings.'
      );
    });

    it('shows error when showCalendar is true and weeklyInstructionalMinutes is invalid', () => {
      ajaxSpy = jest.spyOn($, 'ajax');
      renderDefault({
        initialShowCalendar: true,
        initialWeeklyInstructionalMinutes: -100,
      });

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(ajaxSpy).not.toHaveBeenCalled();

      screen.getByText(
        'Error Saving: Please provide a positive number of instructional minutes per week in Unit Calendar Settings.'
      );
    });

    it('saves successfully if unit is not a course and only version year is set', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndKeepEditingButton = screen.getByRole('button', {
        name: 'Save and Keep Editing',
      });
      fireEvent.click(saveAndKeepEditingButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();
      expect(screen.queryByText(/Last saved at:/)).not.toBeInTheDocument();

      deferred.resolve({scriptPath: '/s/test-unit'});

      await waitFor(() => {
        screen.getByText(/Last saved at:/);
      });

      expect(document.querySelector('.fa-spinner')).not.toBeInTheDocument();
      expect(navigateToHref).not.toHaveBeenCalled();
    });

    it('can save and close', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndCloseButton = screen.getByRole('button', {
        name: 'Save and Close',
      });
      fireEvent.click(saveAndCloseButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();

      deferred.resolve({scriptPath: '/s/test-unit'});

      await waitFor(() => {
        expect(navigateToHref).toHaveBeenCalledWith(
          `/s/test-unit${window.location.search}`
        );
      });
    });

    it('shows error when save and close has error saving', async () => {
      const deferred = mockAjax();
      renderDefault({});

      const saveAndCloseButton = screen.getByRole('button', {
        name: 'Save and Close',
      });
      fireEvent.click(saveAndCloseButton);

      expect(document.querySelector('.fa-spinner')).toBeInTheDocument();

      deferred.reject({status: 404, responseText: 'There was an error'});

      await waitFor(() => {
        screen.getByText('Error Saving: There was an error');
      });

      expect(document.querySelector('.fa-spinner')).not.toBeInTheDocument();
      expect(navigateToHref).not.toHaveBeenCalled();
    });
  });
});
