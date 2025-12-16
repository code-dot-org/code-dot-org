import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import StudentCFUWidget from '@cdo/apps/templates/studentSnapshot/studentCFUWidget/StudentCFUWidget';

const SAMPLE_CFU_LEVELS = [
  {
    id: 21103,
    name: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    display_name: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    type: 'Multi',
    key: 'programming-fundamentals-lesson5-level6_2025-launch_2025',
    script_level_id: 1943,
    progression: 'Check Your Understanding',
    progression_display_name: 'Check Your Understanding',
  },
  {
    id: 11816,
    name: 'programming-fundamentals-lesson5-vocab_2025',
    display_name: 'programming-fundamentals-lesson5-vocab_2025',
    type: 'Match',
    key: 'programming-fundamentals-lesson5-vocab_2025',
    script_level_id: 1947,
    progression: 'Check Your Understanding',
    progression_display_name: 'Check Your Understanding',
  },
];

describe('StudentCFUWidget', () => {
  it('shows loading state when isLoading is true', () => {
    render(
      <StudentCFUWidget
        cfuLevels={[]}
        isLoading={true}
        gridWidth={2}
        gridHeight={2}
      />
    );

    // WidgetTemplate renders a Spinner with id="uitest-spinner" when loading
    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it('shows empty state when there is no CFU data', () => {
    render(
      <StudentCFUWidget
        cfuLevels={[]}
        isLoading={false}
        gridWidth={2}
        gridHeight={2}
      />
    );

    expect(
      screen.getByText('No CFU data available for this lesson.')
    ).toBeInTheDocument();
  });

  it('renders raw CFU JSON when data is provided', () => {
    render(
      <StudentCFUWidget
        cfuLevels={SAMPLE_CFU_LEVELS}
        isLoading={false}
        gridWidth={2}
        gridHeight={2}
      />
    );

    // Check for a couple of key strings from the sample data to ensure JSON is rendered
    expect(
      screen.getByText(
        /programming-fundamentals-lesson5-level6_2025-launch_2025/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/programming-fundamentals-lesson5-vocab_2025/)
    ).toBeInTheDocument();
  });
});
