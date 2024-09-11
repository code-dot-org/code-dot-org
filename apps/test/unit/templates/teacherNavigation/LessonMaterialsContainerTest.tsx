import {render, screen} from '@testing-library/react';
import React from 'react';
import {useLoaderData} from 'react-router-dom';

import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/LessonMaterialsContainer';

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
              type: 'Slides',
              key: 'resourceKey1',
              name: 'my resource',
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
              type: 'Slides',
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
    screen.getByRole('option', {name: 'Lesson 1 - First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 - Second lesson'});
  });
});
