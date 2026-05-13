import Checkbox from '@code-dot-org/component-library/checkbox';
import {CheckboxDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useMemo, useState} from 'react';

import {noteColorClassName} from './teacherDashboardNoteColors';
import {
  DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR,
  TeacherDashboardNote,
  TeacherDashboardNoteColor,
  TeacherDashboardNoteContextType,
  TeacherDashboardNotePayload,
  TeacherDashboardNoteSection,
  TEACHER_DASHBOARD_NOTE_COLORS,
} from './teacherDashboardNotesTypes';
import TeacherNoteMarkdown from './TeacherNoteMarkdown';

import styles from './lesson-materials.module.scss';

const MAX_NOTE_LENGTH = 20_000;
const MAX_TITLE_LENGTH = 255;
const SAVE_FOR_HELP_TEXT =
  'All of my sections keeps the note available when you switch sections. Choosing one section keeps it on that section.';
const ALL_SECTIONS_TARGET = 'all';

interface TeacherDashboardNoteEditorProps {
  note?: TeacherDashboardNote;
  contextType: TeacherDashboardNoteContextType;
  unitGroupId?: number | null;
  unitId: number;
  sectionId: number;
  sections: TeacherDashboardNoteSection[];
  lessonId?: number | null;
  lessonName?: string;
  onSave: (payload: TeacherDashboardNotePayload) => Promise<void>;
  onCancel: () => void;
}

const contextPayload = (
  contextType: TeacherDashboardNoteContextType,
  unitGroupId: number | null | undefined,
  unitId: number,
  lessonId: number | null | undefined
) => ({
  unitGroupId: contextType === 'course' ? unitGroupId : null,
  unitId: contextType === 'unit' ? unitId : null,
  lessonId: contextType === 'lesson' ? lessonId : null,
});

const TeacherDashboardNoteEditor: React.FC<TeacherDashboardNoteEditorProps> = ({
  note,
  contextType,
  unitGroupId,
  unitId,
  sectionId,
  sections,
  lessonId,
  lessonName,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [body, setBody] = useState(note?.body || '');
  const [noteColor, setNoteColor] = useState<TeacherDashboardNoteColor>(
    note?.noteColor || DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR
  );
  const [saveTarget, setSaveTarget] = useState(
    note?.sectionId?.toString() || ALL_SECTIONS_TARGET
  );
  const [sharedSectionIds, setSharedSectionIds] = useState<number[]>(
    note?.sharedSectionIds || []
  );
  const [shareableGlobally, setShareableGlobally] = useState(
    !!note?.shareableGlobally
  );
  const [colorMenuAnchor, setColorMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedBody = body.trim();

  React.useEffect(() => {
    if (!note) {
      return;
    }
    setTitle(note.title || '');
    setBody(note.body);
    setNoteColor(note.noteColor || DEFAULT_TEACHER_DASHBOARD_NOTE_COLOR);
    setSaveTarget(note.sectionId?.toString() || ALL_SECTIONS_TARGET);
    setSharedSectionIds(note.sharedSectionIds || []);
    setShareableGlobally(!!note.shareableGlobally);
  }, [note]);

  const sortedSections = useMemo(
    () => [
      ...sections.filter(section => section.id === sectionId),
      ...sections.filter(section => section.id !== sectionId),
    ],
    [sectionId, sections]
  );

  const saveTargetOptions = useMemo(
    () => [
      {value: ALL_SECTIONS_TARGET, label: 'All of my sections'},
      ...sortedSections.map(section => ({
        value: section.id.toString(),
        label:
          section.id === sectionId
            ? `${section.name} (selected)`
            : section.name,
      })),
    ],
    [sectionId, sortedSections]
  );

  const sectionShareOptions = useMemo(
    () =>
      sortedSections.map(section => ({
        value: section.id.toString(),
        label: section.name,
      })),
    [sortedSections]
  );

  const checkedSectionOptions = useMemo(
    () => sharedSectionIds.map(id => id.toString()),
    [sharedSectionIds]
  );

  const updateSharedSection = (value: string, checked: boolean) => {
    const id = Number(value);
    setSharedSectionIds(current =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter(sectionId => sectionId !== id)
    );
  };

  const targetSectionId =
    saveTarget === ALL_SECTIONS_TARGET ? null : Number(saveTarget);
  const targetSectionIsShared =
    targetSectionId !== null && sharedSectionIds.includes(targetSectionId);

  const validationMessage = useMemo(() => {
    if (!trimmedBody) {
      return 'Note text is required.';
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return `Titles must be ${MAX_TITLE_LENGTH} characters or fewer.`;
    }
    if (body.length > MAX_NOTE_LENGTH) {
      return `Notes must be ${MAX_NOTE_LENGTH.toLocaleString()} characters or fewer.`;
    }
    if (contextType === 'lesson' && !lessonId) {
      return 'Choose a lesson before saving a lesson note.';
    }
    if (contextType === 'course' && !unitGroupId) {
      return 'Course context is not available for this unit.';
    }
  }, [
    body.length,
    contextType,
    lessonId,
    title.length,
    trimmedBody,
    unitGroupId,
  ]);

  const save = async () => {
    if (validationMessage) {
      return;
    }

    const effectiveSharedSectionIds =
      targetSectionId === null
        ? sharedSectionIds
        : targetSectionIsShared
        ? [targetSectionId]
        : [];

    setIsSaving(true);
    await onSave({
      title: title.trim() || null,
      body,
      noteColor,
      contextType,
      ...contextPayload(contextType, unitGroupId, unitId, lessonId),
      sectionId: targetSectionId,
      sharedWithSection: effectiveSharedSectionIds.length > 0,
      sharedSectionIds: effectiveSharedSectionIds,
      shareableGlobally,
      lockVersion: note?.lockVersion,
    });
    setIsSaving(false);
  };

  const selectedColorLabel =
    TEACHER_DASHBOARD_NOTE_COLORS.find(color => color.value === noteColor)
      ?.label || 'White';

  return (
    <div className={styles.teacherNoteEditor}>
      <label className={styles.teacherNoteTextAreaLabel}>
        <Typography variant="body3">Title</Typography>
        <input
          className={styles.teacherNoteTitleInput}
          value={title}
          onChange={event => setTitle(event.target.value)}
          maxLength={MAX_TITLE_LENGTH + 1}
        />
      </label>
      <label className={styles.teacherNoteTextAreaLabel}>
        <span className={styles.teacherNoteFieldLabel}>
          <Typography variant="body3">Note</Typography>
          <Typography
            variant="body4"
            className={styles.teacherNoteMarkdownAllowed}
          >
            Markdown allowed
          </Typography>
        </span>
        <textarea
          className={styles.teacherNoteTextArea}
          value={body}
          onChange={event => setBody(event.target.value)}
          maxLength={MAX_NOTE_LENGTH + 1}
        />
      </label>
      <div className={styles.teacherNoteEditorControls}>
        <label>
          <span className={styles.teacherNoteFieldLabel}>
            <Typography variant="body3">Save for</Typography>
            <Tooltip title={SAVE_FOR_HELP_TEXT}>
              <span className={styles.teacherNoteInfoIcon}>
                <FontAwesomeV6Icon iconName="circle-info" iconStyle="solid" />
              </span>
            </Tooltip>
          </span>
          <select
            value={saveTarget}
            onChange={event => setSaveTarget(event.target.value)}
          >
            {saveTargetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.teacherNoteColorControl}>
          <Typography variant="body3">Note color</Typography>
          <MuiButton
            type="button"
            size="small"
            variant="outlined"
            aria-haspopup="menu"
            aria-expanded={!!colorMenuAnchor}
            onClick={event => setColorMenuAnchor(event.currentTarget)}
          >
            <span
              aria-hidden="true"
              className={`${styles.teacherNoteColorSwatch} ${noteColorClassName(
                noteColor
              )}`}
            />
            {selectedColorLabel}
          </MuiButton>
          <Menu
            anchorEl={colorMenuAnchor}
            open={!!colorMenuAnchor}
            onClose={() => setColorMenuAnchor(null)}
          >
            {TEACHER_DASHBOARD_NOTE_COLORS.map(color => (
              <MenuItem
                key={color.value}
                selected={color.value === noteColor}
                onClick={() => {
                  setNoteColor(color.value);
                  setColorMenuAnchor(null);
                }}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    styles.teacherNoteColorSwatch
                  } ${noteColorClassName(color.value)}`}
                />
                {color.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </div>
      <details className={styles.teacherNoteSharingSection}>
        <summary>
          <Typography variant="body3">Sharing</Typography>
        </summary>
        <div className={styles.teacherNoteSharingControls}>
          {targetSectionId !== null ? (
            <div className={styles.teacherNoteCheckboxes}>
              <Checkbox
                name="sharedWithSection"
                ariaLabel="Share with selected section coteachers"
                checked={targetSectionIsShared}
                onChange={() =>
                  setSharedSectionIds(
                    targetSectionIsShared ? [] : [targetSectionId]
                  )
                }
                size="s"
              />
              <Typography variant="body3">
                Share with selected section coteachers
              </Typography>
            </div>
          ) : (
            <CheckboxDropdown
              name="sharedSectionIds"
              labelText="Share note to all coteachers in these sections."
              labelType="thin"
              size="s"
              allOptions={sectionShareOptions}
              checkedOptions={checkedSectionOptions}
              onChange={event =>
                updateSharedSection(event.target.value, event.target.checked)
              }
              onSelectAll={() =>
                setSharedSectionIds(sortedSections.map(section => section.id))
              }
              onClearAll={() => setSharedSectionIds([])}
              selectAllText="Select all"
              clearAllText="Clear"
              disabled={sectionShareOptions.length === 0}
              styleAsFormField
            />
          )}
          <div className={styles.teacherNoteCheckboxes}>
            <Checkbox
              name="shareableGlobally"
              ariaLabel="Allow Code.org to review and share"
              checked={shareableGlobally}
              onChange={() => setShareableGlobally(!shareableGlobally)}
              size="s"
            />
            <Typography variant="body3">
              Allow Code.org to review and share
            </Typography>
          </div>
        </div>
      </details>
      {showPreview && (
        <div
          className={`${styles.teacherNotePreview} ${noteColorClassName(
            noteColor
          )}`}
        >
          <TeacherNoteMarkdown markdown={body} />
        </div>
      )}
      {validationMessage && (
        <Typography variant="body4" className={styles.teacherNoteError}>
          {validationMessage}
        </Typography>
      )}
      <div className={styles.teacherNoteEditorActions}>
        <MuiButton
          type="button"
          size="small"
          variant="text"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide preview' : 'Preview'}
        </MuiButton>
        <MuiButton
          type="button"
          size="small"
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </MuiButton>
        <MuiButton
          type="button"
          size="small"
          variant="contained"
          disabled={!!validationMessage || isSaving}
          onClick={save}
        >
          {isSaving ? 'Saving' : 'Save note'}
        </MuiButton>
      </div>
    </div>
  );
};

export default TeacherDashboardNoteEditor;
