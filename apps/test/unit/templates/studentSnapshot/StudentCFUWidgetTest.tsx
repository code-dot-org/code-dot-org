import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import StudentCFUWidget from '@cdo/apps/templates/studentSnapshot/studentCFUWidget/StudentCFUWidget';

jest.mock('@cdo/apps/util/HttpClient', () => {
  return {
    __esModule: true,
    default: {
      fetchJson: jest.fn(),
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HttpClient = require('@cdo/apps/util/HttpClient').default as {
  fetchJson: jest.Mock;
};

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

const SAMPLE_CFU_RESPONSES = [
  {
    level_id: 21103,
    script_level_id: 1943,
    response: {
      type: 'Multi',
      student_result: [1],
      status: 'correct',
    },
    submitted: true,
    timestamp: '2025-01-01T00:00:00Z',
  },
];

const SAMPLE_LEVEL_GROUP_CFU_LEVELS = [
  {
    id: 80107,
    name: 'programming-fundamentals-lesson3-level7_2025',
    display_name: 'programming-fundamentals-lesson3-level7_2025',
    type: 'LevelGroup',
    key: 'programming-fundamentals-lesson3-level7_2025',
    script_level_id: 1927,
    progression: 'Check for Understanding',
    progression_display_name: 'Check for Understanding',
    question_text: null,
    answers: null,
  },
];

const SAMPLE_LEVEL_GROUP_CFU_RESPONSES = [
  {
    level_id: 80107,
    script_level_id: 1927,
    response: {
      type: 'LevelGroup',
      level_results: [
        {
          level_id: 90001,
          type: 'FreeResponse',
          student_result: 'hello world',
          status: '',
        },
      ],
    },
    submitted: false,
    timestamp: '2025-12-17T17:51:12.000Z',
  },
];

describe('StudentCFUWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when isLoading is true', () => {
    render(<StudentCFUWidget isLoading={true} gridWidth={2} gridHeight={2} />);

    // WidgetTemplate renders a Spinner with id="uitest-spinner" when loading
    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it('shows empty state when there is no CFU data', async () => {
    HttpClient.fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/student_snapshots/cfu_levels/')) {
        return Promise.resolve({
          value: {cfu_levels: []},
          response: new Response(),
        });
      }
      if (url.startsWith('/student_snapshots/cfu_responses/')) {
        return Promise.resolve({
          value: {cfu_responses: []},
          response: new Response(),
        });
      }
      return Promise.resolve({value: {}, response: new Response()});
    });

    render(
      <StudentCFUWidget
        lessonId={1}
        studentId={1}
        gridWidth={2}
        gridHeight={2}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText('No CFU data available for this lesson.')
      ).toBeInTheDocument();
    });
  });

  it('renders raw CFU JSON when data is provided', async () => {
    HttpClient.fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/student_snapshots/cfu_levels/')) {
        return Promise.resolve({
          value: {cfu_levels: SAMPLE_CFU_LEVELS},
          response: new Response(),
        });
      }

      if (url.startsWith('/student_snapshots/cfu_responses/')) {
        return Promise.resolve({
          value: {cfu_responses: SAMPLE_CFU_RESPONSES},
          response: new Response(),
        });
      }

      return Promise.resolve({value: {}, response: new Response()});
    });

    render(
      <StudentCFUWidget
        lessonId={1}
        studentId={1}
        gridWidth={2}
        gridHeight={2}
      />
    );

    // Check for a couple of key strings from the sample data to ensure JSON is rendered
    await waitFor(() => {
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

  it('renders raw CFU JSON for LevelGroup text-input CFUs', async () => {
    HttpClient.fetchJson.mockImplementation((url: string) => {
      if (url.startsWith('/student_snapshots/cfu_levels/')) {
        return Promise.resolve({
          value: {cfu_levels: SAMPLE_LEVEL_GROUP_CFU_LEVELS},
          response: new Response(),
        });
      }

      if (url.startsWith('/student_snapshots/cfu_responses/')) {
        return Promise.resolve({
          value: {cfu_responses: SAMPLE_LEVEL_GROUP_CFU_RESPONSES},
          response: new Response(),
        });
      }

      return Promise.resolve({value: {}, response: new Response()});
    });

    render(
      <StudentCFUWidget
        lessonId={1}
        studentId={1}
        gridWidth={2}
        gridHeight={2}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/programming-fundamentals-lesson3-level7_2025/)
      ).toBeInTheDocument();
      expect(screen.getByText(/LevelGroup/)).toBeInTheDocument();
      expect(screen.getByText(/hello world/)).toBeInTheDocument();
    });
  });
});
