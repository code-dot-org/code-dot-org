import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ExemplarCodeWidget from '@cdo/apps/templates/studentSnapshot/codeWidget/ExemplarCodeWidget';

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

const SAMPLE_EXEMPLAR_DATA = {
  id: 59486,
  name: 'lesson-name',
  exemplarSources: {
    files: {
      '0': {
        id: '0',
        name: 'main.py',
        language: 'py',
        contents: '# My soccer stats tracker!\ngoals_scored = 5\n',
        folderId: '0',
        active: false,
        open: true,
        type: 'locked_starter',
      },
    },
    folders: {},
    openFiles: ['0'],
  },
};

describe('ExemplarCodeWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays exemplar code when lessonId is provided', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: SAMPLE_EXEMPLAR_DATA,
      response: new Response(),
    });

    render(<ExemplarCodeWidget lessonId={1} />);

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/exemplar_code/1'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Exemplar Code')).toBeInTheDocument();
      expect(
        screen.getByText('# My soccer stats tracker!')
      ).toBeInTheDocument();
    });
  });

  it('does not fetch when lessonId is null', () => {
    render(<ExemplarCodeWidget lessonId={null} />);

    expect(HttpClient.fetchJson).not.toHaveBeenCalled();
  });

  it('handles fetch errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    HttpClient.fetchJson.mockRejectedValue(new Error('Network error'));

    render(<ExemplarCodeWidget lessonId={1} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching exemplar code:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('refetches when lessonId changes', async () => {
    HttpClient.fetchJson.mockResolvedValue({
      value: SAMPLE_EXEMPLAR_DATA,
      response: new Response(),
    });

    const {rerender} = render(<ExemplarCodeWidget lessonId={1} />);

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/exemplar_code/1'
      );
    });

    rerender(<ExemplarCodeWidget lessonId={2} />);

    await waitFor(() => {
      expect(HttpClient.fetchJson).toHaveBeenCalledWith(
        '/student_snapshots/exemplar_code/2'
      );
    });
  });
});
