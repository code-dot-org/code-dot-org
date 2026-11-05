import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import ChallengesPanel from '@cdo/apps/levelbuilder/lesson-editor/challenges/ChallengesPanel';
import {ChallengeEditData} from '@cdo/apps/levelbuilder/lesson-editor/challenges/types';

const challenge: ChallengeEditData = {
  id: 3,
  key: 'challenge-lesson-42-abc',
  question: 'Draw a cat.',
  defaultModality: 'whiteboard',
  rubric: [{level: 0, description: 'No cat'}],
  whiteboardStarterImageAltText: 'an empty box',
  whiteboardStarterImageUrl: '/challenges/3/starter_image',
};

const validJson = JSON.stringify({
  question: 'Draw a dog.',
  default_modality: 'whiteboard',
  rubric: [{level: 0, description: 'No dog'}],
});

const mockFetch = (response: Partial<Response>) =>
  jest
    .spyOn(window, 'fetch')
    .mockResolvedValue({ok: true, ...response} as Response);

const renderPanel = (initialChallenges = [challenge]) =>
  render(
    <ChallengesPanel lessonId={42} initialChallenges={initialChallenges} />
  );

const jsonInput = () => screen.getByLabelText('Challenge JSON');
const saveButton = () => screen.getByRole('button', {name: 'Save'});

describe('ChallengesPanel', () => {
  beforeEach(() => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'test-token';
    document.head.appendChild(meta);
  });

  afterEach(() => {
    document.head.querySelector('meta[name="csrf-token"]')?.remove();
    jest.restoreAllMocks();
  });

  it('renders a row per challenge with its starter image', () => {
    renderPanel();
    expect(screen.getByText('challenge-lesson-42-abc')).toBeTruthy();
    expect(screen.getByAltText('an empty box').getAttribute('src')).toBe(
      '/challenges/3/starter_image'
    );
  });

  it('shows an empty state with no challenges', () => {
    renderPanel([]);
    expect(screen.getByText('No challenges yet.')).toBeTruthy();
  });

  it('shows validation errors and disables save for invalid JSON', () => {
    renderPanel([]);
    fireEvent.click(screen.getByRole('button', {name: /Add Challenge/}));
    fireEvent.change(jsonInput(), {target: {value: '{"question": ""}'}});

    expect(
      screen.getByText('"question" must be a non-empty string.')
    ).toBeTruthy();
    expect((saveButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it('creates a challenge and adds it to the table', async () => {
    const fetchSpy = mockFetch({
      json: () =>
        Promise.resolve({
          ...challenge,
          id: 4,
          key: 'challenge-lesson-42-def',
          whiteboardStarterImageUrl: null,
        }),
    });
    renderPanel([]);
    fireEvent.click(screen.getByRole('button', {name: /Add Challenge/}));
    fireEvent.change(jsonInput(), {target: {value: validJson}});
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByText('challenge-lesson-42-def')).toBeTruthy()
    );
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/challenges');
    expect(options?.method).toBe('POST');
    const body = options?.body as FormData;
    expect(body.get('challenge_json')).toBe(validJson);
    expect(body.get('lesson_id')).toBe('42');
  });

  it('edits a challenge with a PATCH and replaces its row', async () => {
    const fetchSpy = mockFetch({
      json: () => Promise.resolve({...challenge, question: 'Draw a dog.'}),
    });
    renderPanel();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit challenge-lesson-42-abc'})
    );
    expect((jsonInput() as HTMLTextAreaElement).value).toContain('Draw a cat.');
    fireEvent.click(saveButton());

    await waitFor(() => expect(screen.getByText('Draw a dog.')).toBeTruthy());
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/challenges/3');
    expect(options?.method).toBe('PATCH');
    expect(screen.queryByText('Draw a cat.')).toBeNull();
  });

  it('sends remove_starter_image when the image is removed', async () => {
    const fetchSpy = mockFetch({
      json: () =>
        Promise.resolve({
          ...challenge,
          whiteboardStarterImageAltText: null,
          whiteboardStarterImageUrl: null,
        }),
    });
    renderPanel();
    fireEvent.click(
      screen.getByRole('button', {name: 'Edit challenge-lesson-42-abc'})
    );
    fireEvent.click(screen.getByLabelText('Remove starter image'));
    fireEvent.click(saveButton());

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const body = fetchSpy.mock.calls[0][1]?.body as FormData;
    expect(body.get('remove_starter_image')).toBe('1');
  });

  it('removes a deleted challenge', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetch({json: () => Promise.resolve({deleted: true})});
    renderPanel();
    fireEvent.click(
      screen.getByRole('button', {name: 'Delete challenge-lesson-42-abc'})
    );

    await waitFor(() =>
      expect(screen.getByText('No challenges yet.')).toBeTruthy()
    );
  });

  it('shows the server message when a delete is refused', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetch({
      ok: false,
      text: () =>
        Promise.resolve(
          'This challenge has student responses and cannot be deleted.'
        ),
    });
    renderPanel();
    fireEvent.click(
      screen.getByRole('button', {name: 'Delete challenge-lesson-42-abc'})
    );

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        'has student responses'
      )
    );
    expect(screen.getByText('challenge-lesson-42-abc')).toBeTruthy();
  });
});
