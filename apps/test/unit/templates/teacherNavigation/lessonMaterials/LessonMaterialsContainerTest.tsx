import {fireEvent, render, screen, within} from '@testing-library/react';
import React from 'react';
import {useLoaderData} from 'react-router-dom';

import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/lessonMaterials/LessonMaterialsContainer';
import {RESOURCE_ICONS} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceIconType';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: jest.fn(),
}));

describe('LessonMaterialsContainer', () => {
  const mockLessonData = {
    title: 'Unit 3',
    unitNumber: 3,
    lessons: [
      {
        name: 'First lesson',
        id: 1,
        position: 1,
        lessonPlanHtmlUrl: 'studio.code.org/lesson1',
        standardsUrl: 'studio.code.org/standards',
        vocabularyUrl: 'studio.code.org/vocab',
        resources: {
          Teacher: [
            {
              type: 'Handout',
              key: 'resourceKey',
              name: 'my link resource',
              url: 'google.com',
              downloadUrl: 'google.com',
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
              url: 'google.com',
              downloadUrl: 'google.com',
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
    ],
  };

  let windowOpenMock: jest.SpyInstance<
    Window | null,
    Parameters<typeof utils.windowOpen>
  >;

  beforeEach(() => {
    (useLoaderData as jest.Mock).mockReturnValue(mockLessonData);
  });

  it('renders the component and dropdown with lessons', () => {
    render(<LessonMaterialsContainer />);

    // check for unit resources dropdown
    screen.getByRole('button', {name: 'View unit options dropdown'});
    screen.getByText(
      i18n.downloadUnitLessonPlans({unitNumber: mockLessonData.unitNumber})
    );
    screen.getByText(
      i18n.downloadUnitHandouts({unitNumber: mockLessonData.unitNumber})
    );

    // Check for lesson dropdowns
    screen.getByRole('combobox');
    screen.getByRole('option', {name: 'Lesson 1 — First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});
  });

  it('renders the student and teacher resources for the first lesson on render', () => {
    render(<LessonMaterialsContainer />);

    // Teacher resources, including lesson plan, unit vocab and unit standards
    screen.getByText('Teacher Resources');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.SLIDES.icon);
    screen.getByText('Slides: my slides');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan: First lesson');
    // checks that standards and vocab are rendered only once and not rendred in the "student resoruces section"
    screen.getByText('Unit 3 Standards');
    screen.getByText('Unit 3 Vocabulary');

    // Student resources
    screen.getByText('Student Resources');
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.VIDEO.icon);
    screen.getByText('Video: my linked video');
  });

  it('renders the resources for the new lesson when lesson is changed', () => {
    render(<LessonMaterialsContainer />);

    const selectedLessonInput = screen.getAllByRole('combobox')[0];

    fireEvent.change(selectedLessonInput, {target: {value: '2'}});

    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan: Second lesson');

    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.VIDEO.icon);
    screen.getByText('Video: my video resource');
    expect(
      screen.queryAllByTestId('resource-icon-' + RESOURCE_ICONS.SLIDES.icon)
        .length === 0
    );
  });

  describe('resource links', () => {
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
      const menuButton = resourceRow.querySelector('button') as HTMLElement;
      expect(menuButton).toBeDefined();
      fireEvent.click(menuButton);

      const dropdown = menuButton?.nextElementSibling as HTMLElement;
      expect(dropdown.classList.contains('dropdownMenuContainer')).toBe(true);

      const viewButton = within(dropdown).getByText(
        resourceAction
      ) as HTMLElement;
      fireEvent.click(viewButton);
    }

    it('opens lesson plan links in a new tab', () => {
      render(<LessonMaterialsContainer />);
      viewResource('Lesson Plan: First lesson', 'View');
      expect(windowOpenMock).toHaveBeenCalledWith(
        'https://studio.code.org/lesson1',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
});
