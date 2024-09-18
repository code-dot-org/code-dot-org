import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {useLoaderData} from 'react-router-dom';

import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/LessonMaterialsContainer';
import {RESOURCE_TYPE} from '@cdo/apps/templates/teacherNavigation/ResourceIconType';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: jest.fn(),
}));

describe('LessonMaterialsContainer', () => {
  const mockLessonData = {
    title: 'Unit 1',
    lessons: [
      {
        name: 'First lesson',
        id: 1,
        position: 1,
        resources: {
          Teacher: [
            {
              type: 'Handout',
              key: 'resourceKey2',
              name: 'my resource',
              url: 'google.com',
              downloadUrl: 'google.com',
              audience: 'Teacher',
            },
            {
              type: 'Lesson Plan',
              key: 'lessonPlanKey',
              name: 'my lesson plan',
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
        resources: {
          Teacher: [
            {
              type: 'Video',
              key: 'resourceKey2',
              name: 'my resource',
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

  it('renders the component and dropdown with lessons', () => {
    render(<LessonMaterialsContainer />);

    screen.getByRole('combobox');
    screen.getByRole('option', {name: 'Lesson 1 — First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});
  });

  it('renders the teacher resources for the first lesson on render', () => {
    render(<LessonMaterialsContainer />);

    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LINK.icon);
    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.LESSON_PLAN.icon);
  });

  it('renders the teacher resources for the new lesson when lesson is changed', () => {
    render(<LessonMaterialsContainer />);

    const selectedLessonInput = screen.getAllByRole('combobox')[0];

    fireEvent.change(selectedLessonInput, {target: {value: '2'}});

    screen.getByTestId('resource-icon-' + RESOURCE_TYPE.VIDEO.icon);
    expect(
      screen.queryAllByTestId('resource-icon-' + RESOURCE_TYPE.LINK.icon)
        .length === 0
    );
  });
});
