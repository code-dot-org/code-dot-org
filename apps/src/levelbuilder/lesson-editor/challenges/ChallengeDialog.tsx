import {Accordion} from '@code-dot-org/component-library/accordion';
import Checkbox from '@code-dot-org/component-library/checkbox';
import {Typography, Button as MuiButton} from '@mui/material';
import React, {useState} from 'react';

import {
  AUTHENTICITY_TOKEN_HEADER,
  getAuthenticityToken,
} from '@cdo/apps/util/AuthenticityTokenStore';

import LessonEditorDialog from '../LessonEditorDialog';

import {ChallengeEditData} from './types';
import {
  MAX_STARTER_IMAGE_BYTES,
  editableJson,
  validateChallengeJson,
} from './validateChallengeJson';

import moduleStyles from './challenges.module.scss';

const EXAMPLE_CHALLENGE_JSON = JSON.stringify(
  {
    question:
      'No one knows what AI looks like on the inside, so you get to decide. Draw it.',
    default_modality: 'whiteboard',
    rubric: [
      {level: 0, description: 'The drawing does not represent AI.'},
      {
        level: 1,
        description: 'The drawing includes a surface-level AI element.',
      },
      {level: 2, description: 'The drawing shows an idea about how AI works.'},
    ],
    whiteboard_starter_image_alt_text: 'An empty outline of a robot head',
  },
  null,
  2
);

interface ChallengeDialogProps {
  // null when adding a new challenge.
  challenge: ChallengeEditData | null;
  lessonId: number;
  onClose: () => void;
  onSaved: (saved: ChallengeEditData) => void;
}

// Add/edit form for one challenge's JSON and optional PNG starter image.
const ChallengeDialog: React.FC<ChallengeDialogProps> = ({
  challenge,
  lessonId,
  onClose,
  onSaved,
}) => {
  const isEdit = !!challenge;
  const [jsonText, setJsonText] = useState(
    challenge ? editableJson(challenge) : ''
  );
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const storedImageUrl = challenge?.whiteboardStarterImageUrl ?? null;
  const hasImage = !!file || (!!storedImageUrl && !removeImage);
  const isEmpty = jsonText.trim() === '';
  const errors = isEmpty ? [] : validateChallengeJson(jsonText, {hasImage});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    setFile(null);
    setFilePreview(null);
    if (!selected) {
      return;
    }
    if (selected.type !== 'image/png') {
      setError('Starter image must be a PNG.');
      return;
    }
    if (selected.size > MAX_STARTER_IMAGE_BYTES) {
      setError('Starter image must be no larger than 2MB.');
      return;
    }
    setFile(selected);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('lesson_id', String(lessonId));
    formData.append('challenge_json', jsonText);
    if (file) {
      formData.append('starter_image', file);
    }
    if (removeImage) {
      formData.append('remove_starter_image', '1');
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        isEdit ? `/challenges/${challenge.id}` : '/challenges',
        {
          method: isEdit ? 'PATCH' : 'POST',
          body: formData,
          headers: {[AUTHENTICITY_TOKEN_HEADER]: await getAuthenticityToken()},
        }
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      onSaved(await response.json());
      onClose();
    } catch (e) {
      setError(`Failed to save challenge: ${(e as Error).message}`);
      setSaving(false);
    }
  };

  const shownImage = filePreview ?? (removeImage ? null : storedImageUrl);

  return (
    <LessonEditorDialog isOpen handleClose={onClose}>
      <Typography variant="h2" component="h2" className={moduleStyles.title}>
        {isEdit ? 'Edit Challenge' : 'Add Challenge'}
      </Typography>
      {isEdit && (
        <Typography variant="body3" component="p" className={moduleStyles.hint}>
          Key: {challenge.key}
        </Typography>
      )}

      <label className={moduleStyles.field} htmlFor="challenge-json">
        <Typography variant="strong" component="span">
          Challenge JSON
        </Typography>
        <textarea
          id="challenge-json"
          className={moduleStyles.jsonInput}
          value={jsonText}
          rows={14}
          spellCheck={false}
          onChange={e => setJsonText(e.target.value)}
          aria-describedby="challenge-json-errors"
        />
      </label>

      <div id="challenge-json-errors" role="alert">
        {errors.length > 0 && (
          <ul className={moduleStyles.errorList}>
            {errors.map(message => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>

      <label className={moduleStyles.field} htmlFor="challenge-starter-image">
        <Typography variant="strong" component="span">
          Whiteboard starter image (PNG, optional
          {isEdit && storedImageUrl ? ', replaces the current image' : ''})
        </Typography>
        <input
          id="challenge-starter-image"
          type="file"
          accept="image/png"
          className={moduleStyles.fileInput}
          onChange={handleFileChange}
        />
      </label>

      {isEdit && storedImageUrl && !file && (
        <Checkbox
          name="remove-starter-image"
          label="Remove starter image"
          checked={removeImage}
          onChange={() => setRemoveImage(prev => !prev)}
        />
      )}

      {shownImage && (
        <img
          className={moduleStyles.preview}
          src={shownImage}
          alt="Starter preview"
        />
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
            id: 'challenge-example-json',
            label: 'Show example challenge JSON',
            content: (
              <pre className={moduleStyles.exampleCode}>
                {EXAMPLE_CHALLENGE_JSON}
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
          disabled={saving || isEmpty || errors.length > 0}
        >
          {saving ? 'Saving…' : 'Save'}
        </MuiButton>
      </div>
    </LessonEditorDialog>
  );
};

export default ChallengeDialog;
