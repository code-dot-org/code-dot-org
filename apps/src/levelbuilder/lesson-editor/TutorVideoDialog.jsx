import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import HelpTip from '@cdo/apps/sharedComponents/HelpTip';

import LessonEditorDialog from './LessonEditorDialog';

// Mirrors JSONVideo::AUDIENCES in dashboard/app/models/json_video.rb.
const AUDIENCES = ['Student', 'Teacher', 'Verified Teacher'];

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

  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [jsonSchemaVersion, setJsonSchemaVersion] = useState(1);
  const [objectiveIds, setObjectiveIds] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setKey(video?.key || '');
    setDescription(video?.description || '');
    setAudience(video?.audience || AUDIENCES[0]);
    setObjectiveIds(video?.objectiveIds || []);
    setFile(null);
    setError(null);
    setIsSaving(false);
  }, [isOpen, video]);

  const toggleObjective = id => {
    setObjectiveIds(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
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
    formData.append('audience', audience);
    formData.append('json_schema_version', jsonSchemaVersion);
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
      <h2>{isEdit ? 'Edit Video' : 'Add Video'}</h2>

      <label style={styles.label}>
        Key
        <input
          type="text"
          value={key}
          disabled={isEdit}
          style={styles.input}
          onChange={e => setKey(e.target.value)}
        />
        <HelpTip>
          <p>
            Unique identifier for this video. Determines the config filename and
            the S3 object path; cannot be changed after creation.
          </p>
        </HelpTip>
      </label>

      <label style={styles.label}>
        Description
        <textarea
          value={description}
          rows={3}
          style={styles.input}
          onChange={e => setDescription(e.target.value)}
        />
      </label>

      <label style={styles.label}>
        Audience
        <select
          value={audience}
          style={styles.input}
          onChange={e => setAudience(e.target.value)}
        >
          {AUDIENCES.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label style={styles.label}>
        JSON schema version
        <input
          type="number"
          min={1}
          value={jsonSchemaVersion}
          style={styles.input}
          onChange={e => setJsonSchemaVersion(Number(e.target.value))}
        />
      </label>

      <label style={styles.label}>
        Video JSON file{isEdit ? ' (optional — replaces content)' : ''}
        <input
          type="file"
          accept="application/json,.json"
          style={styles.input}
          onChange={e => setFile(e.target.files[0] || null)}
        />
      </label>

      <fieldset style={styles.fieldset}>
        <legend>Objectives</legend>
        {persistedObjectives.length === 0 ? (
          <p style={styles.hint}>
            This lesson has no saved objectives. Save the lesson to add its
            objectives, then associate them here.
          </p>
        ) : (
          persistedObjectives.map(o => (
            <label key={o.id} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={objectiveIds.includes(o.id)}
                style={styles.checkbox}
                onChange={() => toggleObjective(o.id)}
              />
              {o.description}
            </label>
          ))
        )}
      </fieldset>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      <hr />
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Button
          text="Save"
          onClick={handleSave}
          color={Button.ButtonColor.brandSecondaryDefault}
          className="save-tutor-video-button"
          disabled={isSaving}
        />
        {isSaving && (
          <div style={styles.spinner}>
            <FontAwesome icon="spinner" className="fa-spin" />
          </div>
        )}
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

const styles = {
  label: {
    display: 'block',
    margin: '10px 0',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
  },
  fieldset: {
    margin: '10px 0',
    padding: 10,
    border: '1px solid #ccc',
    borderRadius: 4,
  },
  checkboxLabel: {
    display: 'block',
    fontWeight: 'normal',
    margin: '4px 0',
  },
  checkbox: {
    margin: '0 7px 0 0',
  },
  hint: {
    fontStyle: 'italic',
    color: '#555',
  },
  spinner: {
    fontSize: 25,
    padding: 10,
  },
};
