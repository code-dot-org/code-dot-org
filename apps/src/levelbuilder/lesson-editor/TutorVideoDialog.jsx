import {Accordion} from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import TextField from '@code-dot-org/component-library/textField';
import {Typography, Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

// Importing the element registers the <json-video> custom element used by the
// preview player below.
import '@cdo/apps/jsonVideo/jsonVideoElement';
import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';

import LessonEditorDialog from './LessonEditorDialog';

import moduleStyles from './tutorVideoDialog.module.scss';

// Deep dive videos authored here always target students; sent on save rather
// than exposed as an editable field. Must be one of JSONVideo::AUDIENCES in
// dashboard/app/models/json_video.rb.
const DEFAULT_AUDIENCE = 'Student';

// Only one schema version exists today; sent on save rather than exposed as an
// editable field.
const DEFAULT_JSON_SCHEMA_VERSION = 1;

// A minimal but valid video file, shown as a reference for the expected shape.
// A file is a top-level object with a `scenes` array; each scene renders an
// `html` fragment, optionally narrated by `speech`, for `duration` seconds
// (or "auto" to size from the speech length). An optional top-level `audio`
// URL plays as a background track.
const EXAMPLE_VIDEO_JSON = JSON.stringify(
  {
    scenes: [
      {
        html: '<h1 style="font-family: sans-serif; text-align: center; margin-top: 20%">Hello, world!</h1>',
        speech: 'Welcome to this short example video.',
        duration: 3,
      },
      {
        html: '<p style="font-family: sans-serif; text-align: center; margin-top: 20%">The second scene shows different content.</p>',
        speech: 'And here is the second scene.',
        duration: 'auto',
      },
    ],
  },
  null,
  2
);

// Add/edit form for a single tutor deep dive video. Videos are authored as
// JSON files; on create a file upload is required, on edit it is optional and
// only replaces the stored content when provided. Objective associations are
// chosen from the lesson's already-saved objectives.
export default function TutorVideoDialog({
  isOpen,
  video,
  objectives,
  lessonId,
  onClose,
  onSaved,
}) {
  const isEdit = !!video;
  const existingContentHref = isEdit
    ? `/json_videos/${encodeURIComponent(video.key)}/content`
    : null;

  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [objectiveIds, setObjectiveIds] = useState([]);
  const [file, setFile] = useState(null);
  const [previewHref, setPreviewHref] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setKey(video?.key || '');
    setDescription(video?.description || '');
    setObjectiveIds(video?.objectiveIds || []);
    setFile(null);
    // In edit mode, seed the preview with the already-stored content.
    setPreviewHref(
      video ? `/json_videos/${encodeURIComponent(video.key)}/content` : null
    );
    setError(null);
    setIsSaving(false);
  }, [isOpen, video]);

  const toggleObjective = id => {
    setObjectiveIds(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleFileChange = e => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    if (!selected) {
      setPreviewHref(existingContentHref);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result);
        setError(null);
        // The <json-video> element accepts a data: URI directly, so we can
        // preview the chosen file before it is ever uploaded.
        setPreviewHref(
          `data:application/json,${encodeURIComponent(reader.result)}`
        );
      } catch {
        setError('Selected file is not valid JSON.');
        setPreviewHref(null);
      }
    };
    reader.readAsText(selected);
  };

  const handleSave = () => {
    if (!key.trim()) {
      setError('A key is required.');
      return;
    }
    if (!isEdit && !file) {
      setError('A video JSON file is required.');
      return;
    }

    const formData = new FormData();
    formData.append('key', key.trim());
    formData.append('description', description);
    formData.append('audience', DEFAULT_AUDIENCE);
    formData.append('json_schema_version', DEFAULT_JSON_SCHEMA_VERSION);
    formData.append('lesson_id', lessonId);
    // Send an explicit (possibly empty) marker so the server clears
    // associations when none are selected.
    formData.append('objective_ids[]', '');
    objectiveIds.forEach(id => formData.append('objective_ids[]', id));
    if (file) {
      formData.append('file', file);
    }

    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    const url = isEdit
      ? `/json_videos/${encodeURIComponent(video.key)}`
      : '/json_videos';

    setIsSaving(true);
    setError(null);
    fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      body: formData,
      headers: {'X-CSRF-Token': csrfContainer && csrfContainer.content},
    })
      .then(response =>
        response.ok
          ? response.json()
          : response.text().then(text => Promise.reject(text))
      )
      .then(saved => {
        onSaved(saved);
        onClose();
      })
      .catch(err => {
        setError(err ? err.toString() : 'Failed to save video.');
        setIsSaving(false);
      });
  };

  // The picker only offers persisted objectives; a freshly-added objective has
  // no id until the lesson is saved.
  const persistedObjectives = objectives.filter(o => o.id);

  return (
    <LessonEditorDialog isOpen={isOpen} handleClose={onClose}>
      <Typography variant="h2" component="h2" className={moduleStyles.title}>
        {isEdit ? 'Edit JSON Video' : 'Add JSON Video'}
      </Typography>

      <TextField
        className={`${moduleStyles.field} ${moduleStyles.keyField}`}
        name="key"
        label="Key "
        value={key}
        disabled={isEdit}
        onChange={e => setKey(e.target.value)}
        helperMessage={
          isEdit
            ? 'Determines the config filename and S3 object path; cannot be changed after creation.'
            : 'Unique identifier for this video — saving fails if one with this key already exists.'
        }
      />

      <label className={moduleStyles.field} htmlFor="tutor-video-description">
        <Typography variant="strong" component="span">
          Description
        </Typography>
        <textarea
          id="tutor-video-description"
          className={moduleStyles.textarea}
          value={description}
          rows={3}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <fieldset className={moduleStyles.objectives}>
        <legend>
          <Typography variant="strong" component="span">
            Objectives
          </Typography>
        </legend>
        {persistedObjectives.length === 0 ? (
          <Typography variant="body3" className={moduleStyles.hint}>
            This lesson has no saved objectives. Save the lesson to add its
            objectives, then associate them here.
          </Typography>
        ) : (
          <div className={moduleStyles.objectiveList}>
            {persistedObjectives.map(o => (
              <Checkbox
                key={o.id}
                name={`objective-${o.id}`}
                label={o.description}
                checked={objectiveIds.includes(o.id)}
                onChange={() => toggleObjective(o.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      <label className={moduleStyles.field} htmlFor="tutor-video-file">
        <Typography variant="strong" component="span">
          Video JSON file{isEdit ? ' (optional — replaces content)' : ''}
        </Typography>
        <input
          id="tutor-video-file"
          type="file"
          accept="application/json,.json"
          className={moduleStyles.fileInput}
          onChange={handleFileChange}
        />
      </label>

      {previewHref && (
        <div className={moduleStyles.preview}>
          <Typography variant="strong" component="p">
            Preview
          </Typography>
          <div className={moduleStyles.previewPlayer} key={previewHref}>
            <TutorVideo href={previewHref} />
          </div>
        </div>
      )}

      {error && (
        <Typography
          variant="body3"
          component="p"
          className={moduleStyles.error}
          role="alert"
        >
          {error}
        </Typography>
      )}

      <Accordion
        className={moduleStyles.example}
        items={[
          {
            id: 'tutor-video-example-json',
            label: 'Show example JSON file',
            content: (
              <pre className={moduleStyles.exampleCode}>
                {EXAMPLE_VIDEO_JSON}
              </pre>
            ),
          },
        ]}
      />

      <div className={moduleStyles.actions}>
        <MuiButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          className="save-tutor-video-button"
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </MuiButton>
      </div>
    </LessonEditorDialog>
  );
}

TutorVideoDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  video: PropTypes.object,
  objectives: PropTypes.arrayOf(PropTypes.object).isRequired,
  lessonId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
