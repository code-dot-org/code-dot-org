import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {IconButton, Typography} from '@mui/material';
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
  updateTeacherDashboardNoteLayout,
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
const noteColumns = [0, 1];

const columnId = (
  contextType: TeacherDashboardNoteContextType,
  column: number
) => `${contextType}-${column}`;

const parseColumnId = (id: UniqueIdentifier) => {
  const [, column] = id.toString().split('-');
  const parsedColumn = Number(column);
  return column === undefined || Number.isNaN(parsedColumn)
    ? null
    : parsedColumn;
};

const sortNotesForLayout = (notes: TeacherDashboardNote[]) =>
  [...notes].sort((firstNote, secondNote) => {
    if (firstNote.notePosition !== secondNote.notePosition) {
      return firstNote.notePosition - secondNote.notePosition;
    }
    return firstNote.createdAt.localeCompare(secondNote.createdAt);
  });

const layoutSignature = (notes: TeacherDashboardNote[]) =>
  notes
    .map(note => `${note.id}:${note.noteLayoutColumn}:${note.notePosition}`)
    .join('|');

const layoutNotesAfterDrag = (
  contextType: TeacherDashboardNoteContextType,
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier | null | undefined,
  notes: TeacherDashboardNote[]
) => {
  if (!overId) {
    return null;
  }

  const draggedNote = notes.find(note => note.id === activeId);
  if (!draggedNote) {
    return null;
  }

  const contextNotes = notes.filter(note => note.contextType === contextType);
  const overNote = contextNotes.find(note => note.id === overId);
  const targetColumn =
    overNote?.noteLayoutColumn ??
    parseColumnId(overId) ??
    draggedNote.noteLayoutColumn;

  if (!noteColumns.includes(targetColumn)) {
    return null;
  }

  const notesByColumn = noteColumns.reduce<
    Record<number, TeacherDashboardNote[]>
  >(
    (columns, column) => ({
      ...columns,
      [column]: sortNotesForLayout(
        contextNotes.filter(note => note.noteLayoutColumn === column)
      ),
    }),
    {}
  );
  const sourceColumn = draggedNote.noteLayoutColumn;

  if (sourceColumn === targetColumn) {
    const columnNotes = notesByColumn[sourceColumn];
    const oldIndex = columnNotes.findIndex(note => note.id === activeId);
    const newIndex = overNote
      ? columnNotes.findIndex(note => note.id === overId)
      : columnNotes.length - 1;
    notesByColumn[sourceColumn] = arrayMove(columnNotes, oldIndex, newIndex);
  } else {
    notesByColumn[sourceColumn] = notesByColumn[sourceColumn].filter(
      note => note.id !== activeId
    );
    const targetNotes = notesByColumn[targetColumn];
    const overIndex = overNote
      ? targetNotes.findIndex(note => note.id === overId)
      : targetNotes.length;
    notesByColumn[targetColumn] = [
      ...targetNotes.slice(0, overIndex),
      {...draggedNote, noteLayoutColumn: targetColumn},
      ...targetNotes.slice(overIndex),
    ];
  }

  const relaidContextNotes = noteColumns.flatMap(column =>
    notesByColumn[column].map((note, index) => ({
      ...note,
      noteLayoutColumn: column,
      notePosition: index,
    }))
  );

  return notes.map(
    note =>
      relaidContextNotes.find(updatedNote => updatedNote.id === note.id) || note
  );
};

interface SortableTeacherDashboardNoteCardProps {
  note: TeacherDashboardNote;
  activeNoteId: number | null;
  onEdit: (note: TeacherDashboardNote) => void;
  onDelete: (note: TeacherDashboardNote) => void;
}

const SortableTeacherDashboardNoteCard: React.FC<
  SortableTeacherDashboardNoteCardProps
> = ({note, activeNoteId, onEdit, onDelete}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id: note.id});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  if (note.id === activeNoteId) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={styles.teacherNoteDropSlot}
      >
        <div />
        <div />
        <div />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? styles.teacherNoteDragging : undefined}
    >
      <TeacherDashboardNoteCard
        note={note}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandle={
          <IconButton
            {...attributes}
            {...listeners}
            aria-label="Drag note"
            size="small"
            onClick={() => {}}
          >
            <FontAwesomeV6Icon iconName="grip-vertical" iconStyle="solid" />
          </IconButton>
        }
      />
    </div>
  );
};

interface TeacherNotesColumnProps {
  id: string;
  notes: TeacherDashboardNote[];
  activeNoteId: number | null;
  onEdit: (note: TeacherDashboardNote) => void;
  onDelete: (note: TeacherDashboardNote) => void;
}

const TeacherNotesColumn: React.FC<TeacherNotesColumnProps> = ({
  id,
  notes,
  activeNoteId,
  onEdit,
  onDelete,
}) => {
  const {isOver, setNodeRef} = useDroppable({id});

  return (
    <div
      ref={setNodeRef}
      className={`${styles.teacherNotesColumn} ${
        isOver ? styles.teacherNotesColumnOver : ''
      }`}
    >
      <SortableContext
        items={notes.map(note => note.id)}
        strategy={verticalListSortingStrategy}
      >
        {notes.map(note => (
          <SortableTeacherDashboardNoteCard
            key={note.id}
            note={note}
            activeNoteId={activeNoteId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </SortableContext>
    </div>
  );
};

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
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [activeContext, setActiveContext] =
    useState<TeacherDashboardNoteContextType | null>(null);
  const [dragPreviewNotes, setDragPreviewNotes] = useState<
    TeacherDashboardNote[] | null
  >(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 10},
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  const notesForDisplay = useMemo(
    () => dragPreviewNotes || notes,
    [dragPreviewNotes, notes]
  );
  const activeNote = activeNoteId
    ? notes.find(note => note.id === activeNoteId)
    : null;

  const groupedNotes = useMemo(
    () =>
      contextOrder.map(contextType => ({
        contextType,
        label: labelForContext(contextType),
        notes: notesForDisplay.filter(note => note.contextType === contextType),
      })),
    [labelForContext, notesForDisplay]
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

  const nextNotePosition = (contextType: TeacherDashboardNoteContextType) =>
    notes.filter(
      note => note.contextType === contextType && note.noteLayoutColumn === 0
    ).length;

  const persistLayoutChanges = async (
    previousNotes: TeacherDashboardNote[],
    updatedNotes: TeacherDashboardNote[]
  ) => {
    const changedNotes = updatedNotes.filter(updatedNote => {
      const previousNote = previousNotes.find(
        note => note.id === updatedNote.id
      );
      return (
        previousNote &&
        (previousNote.noteLayoutColumn !== updatedNote.noteLayoutColumn ||
          previousNote.notePosition !== updatedNote.notePosition)
      );
    });

    if (changedNotes.length === 0) {
      return;
    }

    try {
      const savedNotes = await Promise.all(
        changedNotes.map(note =>
          updateTeacherDashboardNoteLayout(note.id, {
            noteLayoutColumn: note.noteLayoutColumn,
            notePosition: note.notePosition,
          })
        )
      );
      setNotes(current =>
        current.map(
          note => savedNotes.find(savedNote => savedNote.id === note.id) || note
        )
      );
    } catch {
      setNotes(previousNotes);
      setError('Notes could not be reordered.');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const activeNote = notes.find(note => note.id === event.active.id);
    setActiveNoteId(activeNote?.id || null);
    setActiveContext(activeNote?.contextType || null);
    setDragPreviewNotes(activeNote ? notes : null);
  };

  const handleDragOver = (
    contextType: TeacherDashboardNoteContextType,
    event: DragOverEvent
  ) => {
    const {active, over} = event;
    const draggedNote = notes.find(note => note.id === active.id);
    if (draggedNote?.contextType !== contextType) {
      return;
    }

    setDragPreviewNotes(currentPreviewNotes => {
      const currentNotes = currentPreviewNotes || notes;
      const updatedNotes = layoutNotesAfterDrag(
        contextType,
        active.id,
        over?.id,
        currentNotes
      );
      if (
        !updatedNotes ||
        layoutSignature(updatedNotes) === layoutSignature(currentNotes)
      ) {
        return currentPreviewNotes;
      }
      return updatedNotes;
    });
  };

  const handleDragCancel = () => {
    setActiveNoteId(null);
    setActiveContext(null);
    setDragPreviewNotes(null);
  };

  const handleDragEnd = (
    contextType: TeacherDashboardNoteContextType,
    event: DragEndEvent
  ) => {
    const {active, over} = event;
    if (!over) {
      handleDragCancel();
      return;
    }

    const updatedNotes =
      dragPreviewNotes ||
      layoutNotesAfterDrag(contextType, active.id, over.id, notes);
    const previousNotes = notes;
    setActiveNoteId(null);
    setActiveContext(null);
    setDragPreviewNotes(null);

    if (
      !updatedNotes ||
      layoutSignature(updatedNotes) === layoutSignature(previousNotes)
    ) {
      return;
    }

    setNotes(updatedNotes);
    persistLayoutChanges(previousNotes, updatedNotes);
  };

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
        groupedNotes.map(group => {
          const groupHasNotes = group.notes.length > 0;
          const showAddButton = !editingNote && !creatingContext;

          return (
            <div key={group.contextType} className={styles.teacherNotesGroup}>
              <div className={styles.teacherNotesGroupHeader}>
                <Typography
                  variant="body3"
                  className={styles.teacherNotesGroupTitle}
                >
                  {group.label}
                </Typography>
                {showAddButton && (
                  <button
                    type="button"
                    className={styles.teacherNoteHeaderAddButton}
                    disabled={!canCreateContext(group.contextType)}
                    onClick={() => setCreatingContext(group.contextType)}
                  >
                    <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
                    <Typography variant="body4">
                      {addNoteLabel(group.contextType)}
                    </Typography>
                  </button>
                )}
              </div>
              {!groupHasNotes && creatingContext !== group.contextType && (
                <div className={styles.teacherNotesEmptyState}>
                  <Typography variant="body4">No notes yet.</Typography>
                </div>
              )}
              {groupHasNotes &&
                (editingNote ? (
                  <div className={styles.teacherNotesColumns}>
                    {noteColumns.map(column => (
                      <div key={column} className={styles.teacherNotesColumn}>
                        {sortNotesForLayout(
                          group.notes.filter(
                            note => note.noteLayoutColumn === column
                          )
                        ).map(note =>
                          editingNote.id === note.id ? (
                            <TeacherDashboardNoteEditor
                              key={note.id}
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
                              key={note.id}
                              note={note}
                              onEdit={noteToEdit => {
                                setCreatingContext(null);
                                setEditingNote(noteToEdit);
                              }}
                              onDelete={deleteNote}
                            />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={event =>
                      handleDragOver(group.contextType, event)
                    }
                    onDragEnd={event => handleDragEnd(group.contextType, event)}
                    onDragCancel={handleDragCancel}
                  >
                    <div className={styles.teacherNotesColumns}>
                      {noteColumns.map(column => (
                        <TeacherNotesColumn
                          key={column}
                          id={columnId(group.contextType, column)}
                          notes={sortNotesForLayout(
                            group.notes.filter(
                              note => note.noteLayoutColumn === column
                            )
                          )}
                          activeNoteId={activeNoteId}
                          onEdit={noteToEdit => {
                            setCreatingContext(null);
                            setEditingNote(noteToEdit);
                          }}
                          onDelete={deleteNote}
                        />
                      ))}
                    </div>
                    <DragOverlay dropAnimation={null}>
                      {activeContext === group.contextType && activeNote ? (
                        <div className={styles.teacherNoteDragOverlay}>
                          <TeacherDashboardNoteCard
                            note={activeNote}
                            onEdit={() => {}}
                            onDelete={() => {}}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                ))}
              {creatingContext === group.contextType && (
                <TeacherDashboardNoteEditor
                  contextType={group.contextType}
                  unitGroupId={unitGroupId}
                  unitId={unitId}
                  sectionId={sectionId}
                  sections={sections}
                  lessonId={lessonId}
                  lessonName={lessonName}
                  noteLayoutColumn={0}
                  notePosition={nextNotePosition(group.contextType)}
                  onSave={saveNewNote}
                  onCancel={() => setCreatingContext(null)}
                />
              )}
            </div>
          );
        })}
    </section>
  );
};

export default TeacherDashboardNotes;
