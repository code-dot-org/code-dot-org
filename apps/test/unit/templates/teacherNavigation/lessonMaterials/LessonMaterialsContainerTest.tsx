import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Provider} from 'react-redux';
import {useLoaderData} from 'react-router-dom';
import {Store} from 'redux';

import {
  getStore,
  stubRedux,
  registerReducers,
  restoreRedux,
} from '@cdo/apps/redux';
import unitSelection, {setUnitName} from '@cdo/apps/redux/unitSelectionRedux';
import teacherSections, {
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainer';
import {RESOURCE_ICONS} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceIconType';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

const SECTIONS = [
  {
    id: 1,
    name: 'Period 2',
    course_offering_id: 123,
    courseVersionId: 2023,
    unitName: 'csd1-2024',
    unitSelection: {
      unitName: 'csd1-2024',
    },
  },
  {
    id: 10,
    name: 'Period 10',
    course_offering_id: 123,
    courseVersionId: 2023,
    courseVersionName: 'csd-2024',
    unitName: null,
    unitSelection: null,
    course_display_name: 'CSD',
  },
  {
    id: 11,
    name: 'Period 11',
    course_offering_id: 1234,
    courseVersionId: 20234,
    courseVersionName: 'csd1-2020',
    unitName: 'csd1-2020',
    unitSelection: {
      unitName: 'csd1-2020',
    },
    course_display_name: 'CSD1-2020',
  },
];
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: jest.fn(),
}));

const renderDefault = async (showNoCurriculumAssigned = false) => {
  const store = getStore();
  await act(async () =>
    render(
      <Provider store={store}>
        <LessonMaterialsContainer
          showNoCurriculumAssigned={showNoCurriculumAssigned}
        />
      </Provider>
    )
  );
};

describe('LessonMaterialsContainer', () => {
  let store: Store;

  const mockLessonData = {
    title: 'Unit 3',
    unitNumber: 3,
    hasNumberedUnits: true,
    versionYear: 2023,
    lessons: [
      {
        name: 'First lesson',
        id: 1,
        position: 1,
        lessonPlanHtmlUrl: '/s/unit/lessons/1',
        lessonPlanPdfUrl: 'https://lesson-plans.code.org/lesson-plan.pdf',
        standardsUrl: 'studio.code.org/standards',
        vocabularyUrl: 'studio.code.org/vocab',
        hasLessonPlan: true,
        isLockable: false,
        resources: {
          Teacher: [
            {
              type: 'Handout',
              key: 'resourceKey',
              name: 'my link resource',
              url: 'https://google.com/resource',
              downloadUrl: 'https://google.com/resource.pdf',
              audience: 'Teacher',
            },
            {
              type: 'Slides',
              key: 'teacherSlides',
              name: 'my slides',
              url: 'https://docs.google.com/presentation/d/ABC/edit',
              audience: 'Teacher',
            },
          ],
          Student: [
            {
              type: 'Video',
              key: 'videoKey1',
              name: 'my linked video',
              url: 'https://youtu.be/WsXNpY3SXe8',
              downloadUrl: 'https://videos.code.org/video.mp4',
              audience: 'Student',
            },
          ],
        },
      },
      {
        name: 'Second lesson',
        id: 2,
        position: 2,
        lessonPlanHtmlUrl: 'studio.code.org/lesson2',
        hasLessonPlan: true,
        isLockable: false,
        resources: {
          Teacher: [
            {
              type: 'Video',
              key: 'videoKey2',
              name: 'my video resource',
              url: 'google.com',
              downloadUrl: 'google.com',
              audience: 'Teacher',
            },
          ],
        },
      },
      {
        name: 'Third lesson',
        id: 3,
        position: 3,
        lessonPlanHtmlUrl: 'studio.code.org/lesson2',
        hasLessonPlan: false,
        isLockable: true,
        resources: {
          Teacher: [],
          Student: [],
        },
      },
    ],
  };

  const mockLessonDataNoLessonPlans = {
    title: 'Unit 3',
    unitNumber: 3,
    hasNumberedUnits: true,
    versionYear: 2023,
    lessons: [
      {
        name: 'First lesson',
        id: 1,
        position: 1,
        lessonPlanHtmlUrl: '/s/unit/lessons/1',
        lessonPlanPdfUrl: 'https://lesson-plans.code.org/lesson-plan.pdf',
        standardsUrl: 'studio.code.org/standards',
        vocabularyUrl: 'studio.code.org/vocab',
        hasLessonPlan: false,
        isLockable: false,
        resources: {
          Teacher: [],
          Student: [],
        },
      },
      {
        name: 'Second lesson',
        id: 2,
        position: 2,
        lessonPlanHtmlUrl: 'studio.code.org/lesson2',
        hasLessonPlan: false,
        isLockable: false,
        resources: {
          Teacher: [],
        },
      },
    ],
  };
  beforeEach(() => {
    (useLoaderData as jest.Mock).mockReturnValue(mockLessonData);
    stubRedux();

    registerReducers({
      unitSelection,
      teacherSections,
    });

    store = getStore();

    store.dispatch(setUnitName('csd1-2024'));
    store.dispatch(setSections(SECTIONS));
    store.dispatch(selectSection(1));
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  it('renders the component and dropdown with lessons', async () => {
    await renderDefault();

    // check for unit resources dropdown
    screen.getByRole('button', {name: 'View unit options dropdown'});
    screen.getByText(
      i18n.downloadUnitXLessonPlans({unitNumber: mockLessonData.unitNumber})
    );
    screen.getByText(
      i18n.downloadUnitXHandouts({unitNumber: mockLessonData.unitNumber})
    );

    // Check for lesson dropdowns
    screen.getByRole('combobox');
    screen.getByRole('option', {name: 'Lesson 1 — First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});
  });

  it('renders the student and teacher resources for the first lesson on render', async () => {
    await renderDefault();

    // Teacher resources, including lesson plan, unit vocab and unit standards
    screen.getByText('Teacher Resources');
    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.SLIDES.icon);
    screen.getByText('Slides: my slides');
    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan: First lesson');
    // checks that standards and vocab are rendered only once and not rendred in the "student resoruces section"
    screen.getByText('Unit 3 Standards');
    screen.getByText('Unit 3 Vocabulary');

    // Student resources
    screen.getByText('Student Resources');
    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.VIDEO.icon);
    screen.getByText('Video: my linked video');
  });

  it('renders "Unit Standards" and "Unit Vocabulary" when hasNumberedUnits is false', async () => {
    const lessonDataWithoutNumberedUnits = {
      ...mockLessonData,
      hasNumberedUnits: false,
    };

    (useLoaderData as jest.Mock).mockReturnValue(
      lessonDataWithoutNumberedUnits
    );

    await renderDefault();

    screen.getByText('Unit Standards');
    screen.getByText('Unit Vocabulary');
    screen.getByText(i18n.downloadUnitLessonPlans());
    screen.getByText(i18n.downloadUnitHandouts());
  });

  it('shows no student resources if no student resources are provided', async () => {
    await renderDefault();

    // check for unit resources dropdown
    screen.getByRole('button', {name: 'View unit options dropdown'});
    screen.getByText(
      i18n.downloadUnitXLessonPlans({unitNumber: mockLessonData.unitNumber})
    );
    screen.getByText(
      i18n.downloadUnitXHandouts({unitNumber: mockLessonData.unitNumber})
    );

    // Check for lesson dropdowns
    const lessonDropdown = screen.getByRole('combobox');
    screen.getByRole('option', {name: 'Lesson 1 — First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});

    fireEvent.change(lessonDropdown, {
      target: {value: '2'},
    });

    screen.getByText('Lesson Plan: Second lesson');
    screen.getByText(i18n.noStudentResources());
  });

  it('notifies users if no curriculum is assigned.', async () => {
    await act(async () => {
      renderDefault(true);
    });

    screen.getByAltText('blank screen');
    screen.getByText(i18n.emptySectionHeadline());
    screen.getByText(i18n.noCurriculumAssigned());
    screen.getByText(i18n.browseCurriculum());
  });

  it('tells users to select a unit when no unit assigned', async () => {
    const mockNoUnitData = null;
    (useLoaderData as jest.Mock).mockReturnValue(mockNoUnitData);
    store.dispatch(selectSection(10));
    store.dispatch(setUnitName(null));

    await renderDefault();

    screen.getByAltText(i18n.almostThere());
    screen.getByText(i18n.almostThere());
    screen.getByText(
      i18n.noUnitAssigned({page: 'Lesson Materials', courseName: 'CSD'})
    );
    screen.getByText(i18n.assignAUnit());
  });

  it('notifies users that the assigned curriculum is pre-2020', async () => {
    const legacyData = {...mockLessonData, versionYear: 2020};
    (useLoaderData as jest.Mock).mockReturnValue(legacyData);
    store.dispatch(setUnitName('csd1-2020'));
    store.dispatch(selectSection(11));

    await renderDefault();

    screen.getByAltText(i18n.almostThere());
    screen.getByText(i18n.lessonMaterialsAreNotAvailable());
    screen.getByText(
      i18n.lessonMaterialsLegacyMessage({courseName: 'CSD1-2020'})
    );
  });

  it('renders the resources for the new lesson when lesson is changed', async () => {
    await renderDefault();

    const selectedLessonInput = screen.getAllByRole('combobox')[0];

    fireEvent.change(selectedLessonInput, {target: {value: '2'}});

    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan: Second lesson');

    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.VIDEO.icon);
    screen.getByText('Video: my video resource');
    expect(
      // eslint-disable-next-line no-restricted-properties
      screen.queryAllByTestId('resource-icon-' + RESOURCE_ICONS.SLIDES.icon)
        .length === 0
    );
  });

  it('renders will render message when there is no lesson plan', async () => {
    await renderDefault();

    const selectedLessonInput = screen.getAllByRole('combobox')[0];

    fireEvent.change(selectedLessonInput, {target: {value: '3'}});

    screen.getByText('No teacher resources available for this lesson');
  });

  it('renders empty state when there are no lesson plans in the whole unit', async () => {
    (useLoaderData as jest.Mock).mockReturnValue(mockLessonDataNoLessonPlans);
    await renderDefault();

    screen.getByText('There are no lesson materials for this unit.');
  });

  describe('resource links', () => {
    let windowOpenMock: jest.SpyInstance<
      Window | null,
      Parameters<typeof utils.windowOpen>
    >;

    beforeEach(() => {
      windowOpenMock = jest
        .spyOn(utils, 'windowOpen')
        .mockImplementation(() => null);
    });

    afterEach(() => {
      windowOpenMock.mockRestore();
      jest.resetAllMocks();
    });

    function viewResource(resourceName: string, resourceAction: string) {
      const label = screen.getByText(resourceName);
      const resourceRow = label.closest(
        '[data-testid="resource-row"]'
      ) as HTMLElement;
      expect(resourceRow).toBeDefined();
      const menuButton = within(resourceRow).getByLabelText(
        'View options dropdown'
      ) as HTMLElement;
      fireEvent.click(menuButton);

      const actionButton = within(resourceRow).getByText(resourceAction);
      fireEvent.click(actionButton);
    }

    it('opens lesson plan', async () => {
      await renderDefault();
      viewResource('Lesson Plan: First lesson', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        '/s/unit/lessons/1',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('downloads lesson plan pdf', async () => {
      await renderDefault();
      viewResource('Lesson Plan: First lesson', 'Download (PDF)');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://lesson-plans.code.org/lesson-plan.pdf',
        '_self'
      );
    });

    it('opens handout', async () => {
      await renderDefault();
      viewResource('Handout: my link resource', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://google.com/resource',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('downloads handout', async () => {
      await renderDefault();
      viewResource('Handout: my link resource', 'Download');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://google.com/resource.pdf',
        '_self'
      );
    });

    it('opens slides', async () => {
      await renderDefault();
      viewResource('Slides: my slides', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://docs.google.com/presentation/d/ABC/edit',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('downloads slides as pdf', async () => {
      await renderDefault();
      viewResource('Slides: my slides', 'Download (PDF)');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://docs.google.com/presentation/d/ABC/export?format=pdf',
        '_self'
      );
    });

    it('downloads slides as microsoft office', async () => {
      await renderDefault();
      viewResource('Slides: my slides', 'Download (Microsoft Office)');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://docs.google.com/presentation/d/ABC/export?format=pptx',
        '_self'
      );
    });

    it('makes a copy of slides in google docs', async () => {
      await renderDefault();
      viewResource('Slides: my slides', 'Make a copy (Google Docs)');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://docs.google.com/presentation/d/ABC/copy',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens unit vocabulary', async () => {
      await renderDefault();
      viewResource('Unit 3 Vocabulary', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://studio.code.org/vocab',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens unit standards', async () => {
      await renderDefault();
      viewResource('Unit 3 Standards', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://studio.code.org/standards',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens video', async () => {
      await renderDefault();
      viewResource('Video: my linked video', 'Watch');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://youtu.be/WsXNpY3SXe8',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('downloads video', async () => {
      await renderDefault();
      viewResource('Video: my linked video', 'Download');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://videos.code.org/video.mp4',
        '_self'
      );
    });
  });
});
