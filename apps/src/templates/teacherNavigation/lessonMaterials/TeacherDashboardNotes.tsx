import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {isNetworkError} from '@cdo/apps/util/HttpClient';

import TeacherDashboardNoteCard from './TeacherDashboardNoteCard';
import TeacherDashboardNoteEditor from './TeacherDashboardNoteEditor';
import {
  createTeacherDashboardNote,
  deleteTeacherDashboardNote,
  fetchTeacherDashboardNotes,
  updateTeacherDashboardNote,
} from './teacherDashboardNotesApi';
import {
  TeacherDashboardNote,
  TeacherDashboardNoteConflict,
  TeacherDashboardNoteContextType,
  TeacherDashboardNotePayload,
  TeacherDashboardNoteSection,
} from './teacherDashboardNotesTypes';

import styles from './lesson-materials.module.scss';

interface TeacherDashboardNotesProps {
  sectionId: number;
  unitId: number;
  unitGroupId?: number | null;
  courseName?: string | null;
  unitName?: string;
  lessonId?: number | null;
  lessonName?: string;
  sections: TeacherDashboardNoteSection[];
}

const contextOrder: TeacherDashboardNoteContextType[] = [
  'lesson',
  'unit',
  'course',
];

const TeacherDashboardNotes: React.FC<TeacherDashboardNotesProps> = ({
  sectionId,
  unitId,
  unitGroupId,
  courseName,
  unitName,
  lessonId,
  lessonName,
  sections,
}) => {
  const [notes, setNotes] = useState<TeacherDashboardNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingContext, setCreatingContext] =
    useState<TeacherDashboardNoteContextType | null>(null);
  const [editingNote, setEditingNote] = useState<TeacherDashboardNote | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    fetchTeacherDashboardNotes({sectionId, unitId, unitGroupId, lessonId})
      .then(response => {
        if (isMounted) {
          setNotes(response.notes);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Notes could not be loaded.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, sectionId, unitGroupId, unitId]);

  const labelForContext = useCallback(
    (contextType: TeacherDashboardNoteContextType) => {
      if (contextType === 'course') {
        return courseName ? `Course - ${courseName}` : 'Course';
      }
      if (contextType === 'unit') {
        return unitName || 'Unit';
      }
      return lessonName ? `Lesson - ${lessonName}` : 'Lesson';
    },
    [courseName, lessonName, unitName]
  );

  const groupedNotes = useMemo(
    () =>
      contextOrder.map(contextType => ({
        contextType,
        label: labelForContext(contextType),
        notes: notes.filter(note => note.contextType === contextType),
      })),
    [labelForContext, notes]
  );

  const canCreateContext = (contextType: TeacherDashboardNoteContextType) =>
    (contextType !== 'course' || !!unitGroupId) &&
    (contextType !== 'lesson' || !!lessonId);

  const addNoteLabel = (contextType: TeacherDashboardNoteContextType) => {
    if (contextType === 'course') {
      return 'Add course note';
    }
    if (contextType === 'unit') {
      return 'Add unit note';
    }
    return 'Add lesson note';
  };

  const noteIsVisibleInCurrentSection = (note: TeacherDashboardNote) =>
    !note.sectionId || note.sectionId === sectionId;

  const saveNewNote = async (payload: TeacherDashboardNotePayload) => {
    const savedNote = await createTeacherDashboardNote({
      ...payload,
      sectionId:
        payload.sectionId === undefined ? sectionId : payload.sectionId,
    });
    if (noteIsVisibleInCurrentSection(savedNote)) {
      setNotes(current => [...current, savedNote]);
    }
    setCreatingContext(null);
    analyticsReporter.sendEvent(EVENTS.TEACHER_DASHBOARD_NOTE_CREATED);
    if (savedNote.shareableGlobally) {
      analyticsReporter.sendEvent(
        EVENTS.TEACHER_DASHBOARD_NOTE_GLOBAL_SHARE_TOGGLED
      );
    }
  };

  const saveExistingNote = async (payload: TeacherDashboardNotePayload) => {
    if (!editingNote) {
      return;
    }

    try {
      const savedNote = await updateTeacherDashboardNote(editingNote.id, {
        ...payload,
        sectionId:
          payload.sectionId === undefined ? sectionId : payload.sectionId,
      });
      setNotes(current =>
        noteIsVisibleInCurrentSection(savedNote)
          ? current.map(note => (note.id === savedNote.id ? savedNote : note))
          : current.filter(note => note.id !== savedNote.id)
      );
      setEditingNote(null);
      analyticsReporter.sendEvent(EVENTS.TEACHER_DASHBOARD_NOTE_UPDATED);
      if (savedNote.sharedWithSection !== editingNote.sharedWithSection) {
        analyticsReporter.sendEvent(
          EVENTS.TEACHER_DASHBOARD_NOTE_SHARE_TOGGLED
        );
      }
      if (savedNote.shareableGlobally !== editingNote.shareableGlobally) {
        analyticsReporter.sendEvent(
          EVENTS.TEACHER_DASHBOARD_NOTE_GLOBAL_SHARE_TOGGLED
        );
      }
    } catch (saveError) {
      if (isNetworkError(saveError) && saveError.response.status === 409) {
        const conflict =
          (await saveError.response.json()) as TeacherDashboardNoteConflict;
        setNotes(current =>
          current.map(note =>
            note.id === conflict.note.id ? conflict.note : note
          )
        );
        setEditingNote(conflict.note);
        setError('This note changed in another tab. Review the latest copy.');
        return;
      }
      throw saveError;
    }
  };

  const deleteNote = async (noteToDelete: TeacherDashboardNote) => {
    if (!window.confirm('Delete this note?')) {
      return;
    }
    await deleteTeacherDashboardNote(noteToDelete.id);
    setNotes(current => current.filter(note => note.id !== noteToDelete.id));
    analyticsReporter.sendEvent(EVENTS.TEACHER_DASHBOARD_NOTE_DELETED);
  };

  return (
    <section className={styles.teacherNotesSection}>
      <div className={styles.teacherNotesHeader}>
        <div className={styles.lessonSummarySectionTitle}>
          <FontAwesomeV6Icon iconName="note-sticky" iconStyle="solid" />
          <Typography variant="body2">Teacher Notes</Typography>
        </div>
      </div>
      {error && (
        <Typography variant="body4" className={styles.teacherNoteError}>
          {error}
        </Typography>
      )}
      {isLoading && <Typography variant="body3">Loading notes...</Typography>}
      {!isLoading &&
        groupedNotes.map(group => (
          <div key={group.contextType} className={styles.teacherNotesGroup}>
            <Typography
              variant="body3"
              className={styles.teacherNotesGroupTitle}
            >
              {group.label}
            </Typography>
            {group.notes.map(note => (
              <React.Fragment key={note.id}>
                {editingNote?.id === note.id ? (
                  <TeacherDashboardNoteEditor
                    note={editingNote}
                    contextType={editingNote.contextType}
                    unitGroupId={unitGroupId}
                    unitId={unitId}
                    sectionId={sectionId}
                    sections={sections}
                    lessonId={lessonId}
                    lessonName={lessonName}
                    onSave={saveExistingNote}
                    onCancel={() => setEditingNote(null)}
                  />
                ) : (
                  <TeacherDashboardNoteCard
                    note={note}
                    onEdit={noteToEdit => {
                      setCreatingContext(null);
                      setEditingNote(noteToEdit);
                    }}
                    onDelete={deleteNote}
                  />
                )}
              </React.Fragment>
            ))}
            {creatingContext === group.contextType ? (
              <TeacherDashboardNoteEditor
                contextType={group.contextType}
                unitGroupId={unitGroupId}
                unitId={unitId}
                sectionId={sectionId}
                sections={sections}
                lessonId={lessonId}
                lessonName={lessonName}
                onSave={saveNewNote}
                onCancel={() => setCreatingContext(null)}
              />
            ) : (
              !editingNote &&
              !creatingContext && (
                <button
                  type="button"
                  className={styles.teacherNoteAddCard}
                  disabled={!canCreateContext(group.contextType)}
                  onClick={() => setCreatingContext(group.contextType)}
                >
                  <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
                  <Typography variant="body3">
                    {addNoteLabel(group.contextType)}
                  </Typography>
                </button>
              )
            )}
          </div>
        ))}
    </section>
  );
};

export default TeacherDashboardNotes;
