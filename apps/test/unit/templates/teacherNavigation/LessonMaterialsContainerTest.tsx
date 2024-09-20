import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {useLoaderData} from 'react-router-dom';

import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/LessonMaterialsContainer';
import {RESOURCE_TYPE} from '@cdo/apps/templates/teacherNavigation/ResourceIconType';
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
        resources: {
          Teacher: [
            {
              type: 'Handout',
              key: 'resourceKey2',
              name: 'my link resource',
              url: 'google.com',
              downloadUrl: 'google.com',
              audience: 'Teacher',
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
              key: 'resourceKey2',
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

  beforeEach(() => {
    (useLoaderData as jest.Mock).mockReturnValue(mockLessonData);
  });

  it('renders dropdown with lessons and dropdown with unit resources', () => {
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

  it('renders the teacher resources, including the lesson plan, for the first lesson on render', () => {
    render(<LessonMaterialsContainer />);

    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LINK.icon);
    screen.getByText('my link resource');
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan');
  });

  it('renders the teacher resources for the new lesson when lesson is changed', () => {
    render(<LessonMaterialsContainer />);

    const selectedLessonInput = screen.getAllByRole('combobox')[0];

    fireEvent.change(selectedLessonInput, {target: {value: '2'}});

    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LESSON_PLAN.icon);
    screen.getByText('Lesson Plan');

    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.VIDEO.icon);
    screen.getByText('my video resource');
    expect(
      screen.queryAllByTestId('resource-icon-' + RESOURCE_TYPE.LINK.icon)
        .length === 0
    );
  });
});
