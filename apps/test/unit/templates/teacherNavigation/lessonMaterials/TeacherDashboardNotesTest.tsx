import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import TeacherDashboardNotes from '@cdo/apps/templates/teacherNavigation/lessonMaterials/TeacherDashboardNotes';
import {
  createTeacherDashboardNote,
  deleteTeacherDashboardNote,
  fetchTeacherDashboardNotes,
  updateTeacherDashboardNote,
} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesApi';
import {TeacherDashboardNote} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesTypes';
import TeacherNoteMarkdown from '@cdo/apps/templates/teacherNavigation/lessonMaterials/TeacherNoteMarkdown';
import {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock(
  '@cdo/apps/templates/teacherNavigation/lessonMaterials/teacherDashboardNotesApi'
);

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  sendEvent: jest.fn(),
}));

const baseNote: TeacherDashboardNote = {
  id: 1,
  title: 'Activity setup',
  body: 'Use pairs for the unplugged activity.',
  noteColor: 'white',
  contextType: 'unit',
  unitGroupId: null,
  unitId: 10,
  lessonId: null,
  sectionId: null,
  sharedWithSection: false,
  sharedSectionIds: [],
  shareableGlobally: false,
  isOwner: true,
  authorName: 'Teacher One',
  createdAt: '2026-05-12T22:00:00Z',
  updatedAt: '2026-05-12T22:00:00Z',
  lockVersion: 0,
};

const renderNotes = (notes: TeacherDashboardNote[] = []) => {
  (fetchTeacherDashboardNotes as jest.Mock).mockResolvedValue({
    contexts: {sectionId: 5, unitGroupId: 100, unitId: 10, lessonId: 20},
    notes,
  });

  return render(
    <TeacherDashboardNotes
      sectionId={5}
      unitGroupId={100}
      unitId={10}
      courseName="AI Foundations (AIF)"
      unitName="Unit 1"
      lessonId={20}
      lessonName="Lesson 2"
      sections={[
        {id: 5, name: 'Period 1'},
        {id: 6, name: 'Period 2'},
      ]}
    />
  );
};

describe('TeacherDashboardNotes', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it('loads notes and renders context groups', async () => {
    renderNotes([
      {...baseNote, id: 1, contextType: 'course', unitGroupId: 100},
      {...baseNote, id: 2, contextType: 'unit', body: 'Unit note'},
      {
        ...baseNote,
        id: 3,
        contextType: 'lesson',
        lessonId: 20,
        body: 'Lesson note',
      },
    ]);

    await screen.findByText('Teacher Notes');
    expect(
      screen.getAllByText('Course - AI Foundations (AIF)').length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Unit 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lesson - Lesson 2').length).toBeGreaterThan(0);
    screen.getByText('Unit note');
    screen.getByText('Lesson note');
  });

  it('shows add note cards for every context without notes', async () => {
    renderNotes();

    await screen.findByText('Add course note');
    screen.getByText('Add unit note');
    screen.getByText('Add lesson note');
  });

  it('creates a section-scoped shared note and global-share candidate', async () => {
    (createTeacherDashboardNote as jest.Mock).mockResolvedValue({
      ...baseNote,
      id: 9,
      body: 'New lesson note',
      contextType: 'lesson',
      lessonId: 20,
      sectionId: 5,
      sharedWithSection: true,
      sharedSectionIds: [5],
      shareableGlobally: true,
    });
    renderNotes();

    fireEvent.click(await screen.findByText('Add lesson note'));
    fireEvent.change(screen.getByLabelText('Note'), {
      target: {value: 'New lesson note'},
    });
    fireEvent.change(screen.getByLabelText('Save for'), {
      target: {value: '5'},
    });
    fireEvent.click(screen.getByText('Sharing'));
    fireEvent.click(
      screen.getByLabelText('Share with selected section coteachers')
    );
    fireEvent.click(
      screen.getByLabelText('Allow Code.org to review and share')
    );
    fireEvent.click(screen.getByText('Save note'));

    await waitFor(() => expect(createTeacherDashboardNote).toHaveBeenCalled());
    expect(createTeacherDashboardNote).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'New lesson note',
        noteColor: 'white',
        contextType: 'lesson',
        lessonId: 20,
        sectionId: 5,
        sharedWithSection: true,
        sharedSectionIds: [5],
        shareableGlobally: true,
      })
    );
    await screen.findByText('New lesson note');
    expect(analyticsReporter.sendEvent).toHaveBeenCalled();
  });

  it('edits and deletes owned notes', async () => {
    (updateTeacherDashboardNote as jest.Mock).mockResolvedValue({
      ...baseNote,
      body: 'Updated note',
      lockVersion: 1,
    });
    (deleteTeacherDashboardNote as jest.Mock).mockResolvedValue(undefined);
    renderNotes([baseNote]);

    await screen.findByText('Use pairs for the unplugged activity.');
    fireEvent.click(screen.getByLabelText('Edit note'));
    fireEvent.change(screen.getByLabelText('Note'), {
      target: {value: 'Updated note'},
    });
    fireEvent.click(screen.getByText('Save note'));

    await waitFor(() => expect(updateTeacherDashboardNote).toHaveBeenCalled());
    await screen.findByText('Updated note');

    fireEvent.click(screen.getByLabelText('Delete note'));
    await waitFor(() =>
      expect(deleteTeacherDashboardNote).toHaveBeenCalledWith(baseNote.id)
    );
    expect(screen.queryByText('Updated note')).toBeNull();
  });

  it('renders shared coteacher notes as read only', async () => {
    renderNotes([
      {
        ...baseNote,
        isOwner: false,
        authorName: 'Ms. Rivera',
        sectionId: 5,
        sharedWithSection: true,
        sharedSectionIds: [5],
      },
    ]);

    await screen.findByText('Shared by Ms. Rivera', {exact: false});
    screen.getByText('Read only');
    expect(screen.queryByLabelText('Edit note')).toBeNull();
    expect(screen.queryByLabelText('Delete note')).toBeNull();
  });

  it('shows a stale edit conflict and refreshes the current note body', async () => {
    const response = new Response(
      JSON.stringify({
        error: 'stale note',
        note: {...baseNote, body: 'Current body', lockVersion: 2},
      }),
      {status: 409, statusText: 'Conflict'}
    );
    const error = new NetworkError('409 Conflict', response);
    (updateTeacherDashboardNote as jest.Mock).mockRejectedValue(error);
    renderNotes([baseNote]);

    await screen.findByText('Use pairs for the unplugged activity.');
    fireEvent.click(screen.getByLabelText('Edit note'));
    fireEvent.change(screen.getByLabelText('Note'), {
      target: {value: 'Stale body'},
    });
    fireEvent.click(screen.getByText('Save note'));

    await screen.findByText(
      'This note changed in another tab. Review the latest copy.'
    );
    expect((screen.getByLabelText('Note') as HTMLTextAreaElement).value).toBe(
      'Current body'
    );
  });
});

describe('TeacherNoteMarkdown', () => {
  it('renders ordinary markdown and strips unsafe embedded content', () => {
    render(
      <TeacherNoteMarkdown
        markdown={`# Heading

- one
- two

> quote

\`\`\`
code
\`\`\`

<script>alert("x")</script><iframe src="https://example.com"></iframe>
[link](https://code.org)`}
      />
    );

    screen.getByRole('heading', {name: 'Heading'});
    screen.getByText('one');
    screen.getByText('quote');
    screen.getByText('code');
    expect(screen.getByRole('link', {name: 'link'}).getAttribute('href')).toBe(
      'https://code.org'
    );
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('renders table markup through the strict sanitizer', () => {
    render(
      <TeacherNoteMarkdown markdown="<table><tbody><tr><td>A</td></tr></tbody></table>" />
    );

    const table = screen.getByRole('table');
    expect(within(table).getByText('A')).toBeTruthy();
  });
});
