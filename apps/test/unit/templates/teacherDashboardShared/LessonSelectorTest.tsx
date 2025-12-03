import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import LessonSelector from '@cdo/apps/templates/teacherDashboardShared/LessonSelector';
import {Lesson} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/LessonMaterialTypes';

const mockLessons: Lesson[] = [
  {
    id: 1,
    name: 'First lesson',
    position: 1,
    lessonPlanHtmlUrl: 'http://example.com/lesson1.html',
    lessonPlanPdfUrl: 'http://example.com/lesson1.pdf',
    standardsUrl: 'http://example.com/standards1',
    vocabularyUrl: 'http://example.com/vocabulary1',
    resources: {
      Teacher: [],
      Student: [],
    },
    hasLessonPlan: true,
    isLockable: false,
  },
  {
    id: 2,
    name: 'Second lesson',
    position: 2,
    lessonPlanHtmlUrl: 'http://example.com/lesson2.html',
    lessonPlanPdfUrl: 'http://example.com/lesson2.pdf',
    standardsUrl: 'http://example.com/standards2',
    vocabularyUrl: 'http://example.com/vocabulary2',
    resources: {
      Teacher: [],
      Student: [],
    },
    hasLessonPlan: true,
    isLockable: false,
  },
];

describe('LessonSelector', () => {
  const defaultProps = {
    lessons: mockLessons,
    selectedLesson: mockLessons[0],
    onLessonChange: jest.fn(),
    hasUnnumberedLessons: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders lesson dropdown with options', () => {
    render(<LessonSelector {...defaultProps} />);

    const dropdown = screen.getByRole('combobox', {name: 'Choose a lesson'});

    fireEvent.click(dropdown);

    screen.getByRole('option', {name: 'Lesson 1 — First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});
  });

  it('calls onLessonChange when selection changes', () => {
    const mockOnChange = jest.fn();
    render(<LessonSelector {...defaultProps} onLessonChange={mockOnChange} />);

    const dropdown = screen.getByRole('combobox', {name: 'Choose a lesson'});
    fireEvent.change(dropdown, {target: {value: '2'}});

    expect(mockOnChange).toHaveBeenCalledWith(mockLessons[1].id);
  });

  it('auto-selects first lesson when no lesson is selected', () => {
    const mockOnChange = jest.fn();
    render(
      <LessonSelector
        {...defaultProps}
        selectedLesson={null}
        onLessonChange={mockOnChange}
      />
    );

    expect(mockOnChange).toHaveBeenCalledWith(mockLessons[0].id);
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<LessonSelector {...defaultProps} isLoading={true} />);

    document.querySelector('.skeletonizeContent');
  });

  it('displays lesson names without numbers for unnumbered lessons', () => {
    render(<LessonSelector {...defaultProps} hasUnnumberedLessons={true} />);

    const dropdown = screen.getByRole('combobox', {name: 'Choose a lesson'});
    fireEvent.click(dropdown);

    screen.getByRole('option', {name: 'First lesson'});
    screen.getByRole('option', {name: 'Second lesson'});
  });

  it('displays lesson names without numbers for lockable lessons without lesson plans', () => {
    const lockableLessons = [
      {
        ...mockLessons[0],
        isLockable: true,
        hasLessonPlan: false,
      },
      mockLessons[1],
    ];

    render(
      <LessonSelector
        {...defaultProps}
        lessons={lockableLessons}
        selectedLesson={lockableLessons[0]}
      />
    );

    const dropdown = screen.getByRole('combobox', {name: 'Choose a lesson'});
    fireEvent.click(dropdown);

    screen.getByRole('option', {name: 'First lesson'});
    screen.getByRole('option', {name: 'Lesson 2 — Second lesson'});
  });
});
