import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import StudentCodeWidget from '@cdo/apps/templates/studentSnapshot/codeWidget/StudentCodeWidget';

jest.mock('@cdo/apps/util/HttpClient', () => {
  return {
    __esModule: true,
    default: {
      fetchJson: jest.fn(),
    },
  };
});

const HttpClient = require('@cdo/apps/util/HttpClient').default as {
  fetchJson: jest.Mock;
};

const SAMPLE_STUDENT_CODE = {
  'main.py': '# My soccer stats tracker!\ngoals_scored = 5\n',
};

describe('StudentCodeWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays student code when all ids are provided', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: {studentCode: SAMPLE_STUDENT_CODE},
      response: new Response(),
    });

    render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/units/1/lessons/2/students/3/code'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Student Code')).toBeInTheDocument();
      expect(
        screen.getByText('# My soccer stats tracker!')
      ).toBeInTheDocument();
    });
  });

  it('renders nothing once the code fetch settles, when the lesson has no code-capable level', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: {studentCode: {}},
      response: new Response(),
    });

    const {container} = render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={3}
        hasCodeLevel={false}
      />
    );

    // Still loading immediately after mount, so it doesn't hide before the
    // in-flight fetch has had a chance to settle.
    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('does not fetch when selectedLessonId is null', () => {
    render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={null}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('does not fetch when selectedStudentId is null', () => {
    render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={null}
        hasCodeLevel={true}
      />
    );

    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('still shows the widget when the lesson has a code level but the student has not written any code yet', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: {studentCode: {}},
      response: new Response(),
    });

    render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/units/1/lessons/2/students/3/code'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Student Code')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully and still shows the widget when the lesson has a code level', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    HttpClient.fetchJson.mockRejectedValue(new Error('Network error'));

    render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching student code:',
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Student Code')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('refetches when selectedLessonId changes', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: {studentCode: SAMPLE_STUDENT_CODE},
      response: new Response(),
    });

    const {rerender} = render(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={2}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/units/1/lessons/2/students/3/code'
      );
    });

    rerender(
      <StudentCodeWidget
        selectedUnitId={1}
        selectedLessonId={5}
        selectedStudentId={3}
        hasCodeLevel={true}
      />
    );

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/units/1/lessons/5/students/3/code'
      );
    });
  });
});
