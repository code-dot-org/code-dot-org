import $ from 'jquery';
import React, {useState} from 'react';

import SearchBox from '@cdo/apps/levelbuilder/lesson-editor/SearchBox';

import moduleStyles from './jitPlConceptsEditor.module.scss';

export interface JsonVideo {
  id: number;
  key: string;
  description?: string;
  audience?: string;
}

interface Props {
  jsonVideos: JsonVideo[];
  onChange: (videos: JsonVideo[]) => void;
}

interface SearchOption {
  value: string;
  label: string;
  video: JsonVideo;
}

const JsonVideosEditor: React.FC<Props> = ({jsonVideos, onChange}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newS3Uri, setNewS3Uri] = useState('');
  const [newSchemaVersion, setNewSchemaVersion] = useState('1');
  const [newAudience, setNewAudience] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSearchSelect = (option: SearchOption) => {
    if (!option) return;
    if (jsonVideos.find(v => v.id === option.video.id)) return;
    onChange([...jsonVideos, option.video]);
  };

  const constructOptions = (json: JsonVideo[]) => {
    const addedIds = new Set(jsonVideos.map(v => v.id));
    const options = json
      .filter(v => !addedIds.has(v.id))
      .map(v => ({
        value: v.key,
        label: v.description ? `${v.key} — ${v.description}` : v.key,
        video: v,
      }));
    return {options};
  };

  const handleCreate = () => {
    setIsSubmitting(true);
    setCreateError(null);
    $.ajax({
      url: '/json_videos',
      method: 'POST',
      data: {
        key: newKey,
        s3_uri: newS3Uri,
        json_schema_version: parseInt(newSchemaVersion),
        audience: newAudience,
        description: newDescription,
      },
    })
      .done((video: JsonVideo) => {
        onChange([...jsonVideos, video]);
        setIsCreating(false);
        setNewKey('');
        setNewS3Uri('');
        setNewSchemaVersion('1');
        setNewAudience('');
        setNewDescription('');
        setIsSubmitting(false);
      })
      .fail((err: {responseText: string}) => {
        setIsSubmitting(false);
        setCreateError(err.responseText);
      });
  };

  const handleRemove = (id: number) => {
    onChange(jsonVideos.filter(v => v.id !== id));
  };

  return (
    <div>
      <div style={{marginBottom: 8}}>
        <strong>Select a video to add</strong>
        <SearchBox
          onSearchSelect={onSearchSelect}
          searchUrl="json_videos/search"
          constructOptions={constructOptions}
        />
      </div>
      {jsonVideos.length > 0 && (
        <table
          style={{width: '100%', borderCollapse: 'collapse', marginBottom: 8}}
        >
          <thead>
            <tr>
              <th style={thStyle}>Key</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Audience</th>
              <th style={{...thStyle, width: '8%'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jsonVideos.map(v => (
              <tr key={v.id}>
                <td style={tdStyle}>{v.key}</td>
                <td style={tdStyle}>{v.description || ''}</td>
                <td style={tdStyle}>{v.audience || ''}</td>
                <td style={tdStyle}>
                  <button
                    type="button"
                    onClick={() => handleRemove(v.id)}
                    className={moduleStyles.deleteButton}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isCreating ? (
        <div className={moduleStyles.form}>
          {createError && <p className={moduleStyles.error}>{createError}</p>}
          <label className={moduleStyles.label}>
            Key
            <input
              className={moduleStyles.input}
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
            />
          </label>
          <label className={moduleStyles.label}>
            S3 URI
            <input
              className={moduleStyles.input}
              value={newS3Uri}
              onChange={e => setNewS3Uri(e.target.value)}
              placeholder="s3://bucket/path/to/file.json"
            />
          </label>
          <label className={moduleStyles.label}>
            JSON Schema Version
            <input
              className={moduleStyles.input}
              type="number"
              value={newSchemaVersion}
              onChange={e => setNewSchemaVersion(e.target.value)}
            />
          </label>
          <label className={moduleStyles.label}>
            Audience
            <input
              className={moduleStyles.input}
              value={newAudience}
              onChange={e => setNewAudience(e.target.value)}
            />
          </label>
          <label className={moduleStyles.label}>
            Description
            <input
              className={moduleStyles.input}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
            />
          </label>
          <div className={moduleStyles.formButtons}>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className={moduleStyles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className={moduleStyles.addButton}
        >
          + Create New JSON Video
        </button>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '4px 8px',
  borderBottom: '1px solid #ddd',
  background: '#f5f5f5',
};

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderBottom: '1px solid #eee',
  verticalAlign: 'middle',
};

export default JsonVideosEditor;
