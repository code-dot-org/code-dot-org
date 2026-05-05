import $ from 'jquery';
import React, {useState} from 'react';

import SearchBox from '@cdo/apps/levelbuilder/lesson-editor/SearchBox';

const AUDIENCE_OPTIONS = ['Student', 'Teacher', 'Verified Teacher'];

import moduleStyles from './jitPlConceptsEditor.module.scss';

export interface JsonVideo {
  id: number;
  key: string;
  description?: string;
  audience?: string;
}

interface AssociationTarget {
  type: 'jit_pl_exemplar' | 'jit_pl_misconception' | 'jit_pl_concept';
  id: number;
}

interface Props {
  jsonVideos: JsonVideo[];
  onChange: (videos: JsonVideo[]) => void;
  onVideoCreatingChange?: (isCreating: boolean) => void;
  associationTarget?: AssociationTarget;
}

interface SearchOption {
  value: string;
  label: string;
  video: JsonVideo;
}

const JsonVideosEditor: React.FC<Props> = ({
  jsonVideos,
  onChange,
  onVideoCreatingChange,
  associationTarget,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newS3Uri, setNewS3Uri] = useState('');
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
    onVideoCreatingChange?.(true);
    setCreateError(null);
    $.ajax({
      url: '/json_videos',
      method: 'POST',
      data: {
        key: newKey,
        s3_uri: newS3Uri,
        json_schema_version: 1,
        audience: newAudience,
        description: newDescription,
        ...(associationTarget && {
          [`${associationTarget.type}_id`]: associationTarget.id,
        }),
      },
    })
      .done((video: JsonVideo) => {
        onChange([...jsonVideos, video]);
        setIsCreating(false);
        setNewKey('');
        setNewS3Uri('');
        setNewAudience('');
        setNewDescription('');
        setIsSubmitting(false);
        onVideoCreatingChange?.(false);
      })
      .fail((err: {responseText: string}) => {
        setIsSubmitting(false);
        onVideoCreatingChange?.(false);
        setCreateError(err.responseText);
      });
  };

  const handleRemove = (id: number) => {
    onChange(jsonVideos.filter(v => v.id !== id));
  };

  return (
    <div>
      <div className={moduleStyles.videoSearchWrapper}>
        <strong>Select a video to add</strong>
        <SearchBox
          onSearchSelect={onSearchSelect}
          searchUrl="json_videos/search"
          constructOptions={constructOptions}
        />
      </div>
      {jsonVideos.length > 0 && (
        <table className={moduleStyles.videoTable}>
          <thead>
            <tr>
              <th className={moduleStyles.videoTh}>Key</th>
              <th className={moduleStyles.videoTh}>Description</th>
              <th className={moduleStyles.videoTh}>Audience</th>
              <th className={moduleStyles.videoThActions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jsonVideos.map(v => (
              <tr key={v.id}>
                <td className={moduleStyles.videoTd}>{v.key}</td>
                <td className={moduleStyles.videoTd}>{v.description || ''}</td>
                <td className={moduleStyles.videoTd}>{v.audience || ''}</td>
                <td className={moduleStyles.videoTd}>
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
            Audience
            <select
              value={newAudience}
              onChange={e => setNewAudience(e.target.value)}
            >
              <option value="">{''}</option>
              {AUDIENCE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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

export default JsonVideosEditor;
