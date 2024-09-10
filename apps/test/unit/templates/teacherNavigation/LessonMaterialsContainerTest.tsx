import {render, screen} from '@testing-library/react';
import React from 'react';
import {useLoaderData} from 'react-router-dom';

import LessonMaterialsContainer from '@cdo/apps/templates/teacherNavigation/LessonMaterialsContainer';

// Mock the useLoaderData hook from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: jest.fn(),
}));

describe('LessonMaterialsContainer', () => {
  const mockLessonData = {
    title: 'Unit 1',
    lessons: [
      {name: 'First lesson', id: 1, position: 1},
      {name: 'Second lesson', id: 2, position: 2},
    ],
  };

  beforeEach(() => {
    (useLoaderData as jest.Mock).mockReturnValue(mockLessonData);
  });

  it('renders the component and dropdown with lessons', () => {
    render(<LessonMaterialsContainer />);

    screen.getByText('Lesson');

    screen.getByRole('combobox');
    screen.getByRole('option', {name: 'Lesson 1 - First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 - Second lesson'});
  });
});
