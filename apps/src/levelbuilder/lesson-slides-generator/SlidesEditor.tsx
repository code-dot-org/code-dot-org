import React, {useCallback, useState} from 'react';

import EditPanels from '@cdo/apps/lab2/levelEditors/panels/EditPanels';
import {Panel} from '@cdo/apps/panels/types';

import {saveEditedPanels} from './slidesApi';
import {PersistedSlide} from './types';

import moduleStyles from './lesson-slides-generator.module.scss';

interface SlidesEditorProps {
  lessonId: number;
  lessonName: string;
  initialPanels: Panel[];
  // Existing slides JSON contents — used so we can preserve the
  // per-slide descriptions even when the user only edits panels here.
  // EditPanels has no knowledge of descriptions, so we pair them back
  // by panel.key in saveEditedPanels.
  existingSlides: PersistedSlide[];
  slidesUrl: string;
  generateSlidesUrl: string;
  // Path of the slides JSON file relative to the dashboard repo root,
  // for the editor's "where this saves" prose.
  slidesFilePath: string;
}

const SlidesEditor: React.FC<SlidesEditorProps> = ({
  lessonId,
  lessonName,
  initialPanels,
  existingSlides,
  slidesUrl,
  generateSlidesUrl,
  slidesFilePath,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // EditPanels writes the current panels JSON into a hidden input on
  // every change. For a standalone editor (no surrounding Rails form)
  // we read that input on save instead of plumbing a callback through
  // EditPanels, which would mean forking the lab2 component.
  const handleSave = useCallback(async () => {
    setError(null);
    setIsSaving(true);
    try {
      const input = document.getElementById(
        'level_panels'
      ) as HTMLInputElement | null;
      if (!input) {
        throw new Error("Couldn't read panels — editor not mounted yet");
      }
      const panels: Panel[] = JSON.parse(input.value);
      await saveEditedPanels(lessonId, existingSlides, panels);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }, [lessonId, existingSlides]);

  return (
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.heading}>Edit slides for "{lessonName}"</h1>
      <p className={moduleStyles.subheading}>
        Tweak the generated panels in place. The save button writes back to{' '}
        <code>{slidesFilePath}</code>; the per-slide descriptions visible on the{' '}
        <a href={generateSlidesUrl}>generate page</a> are preserved by matching
        panels back to slides on key.
      </p>

      <div id="panels-editor">
        <EditPanels
          initialPanels={initialPanels}
          levelName={`lesson-${lessonId}-slides`}
        />
      </div>

      {error && (
        <p className={moduleStyles.summaryBad} role="alert">
          {error}
        </p>
      )}

      <footer className={moduleStyles.footer}>
        <a href={slidesUrl} className={moduleStyles.secondaryButton}>
          View slides
        </a>
        <a href={generateSlidesUrl} className={moduleStyles.secondaryButton}>
          Back to slide generator
        </a>
        <button
          type="button"
          className={moduleStyles.primaryButton}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? 'Saving…'
            : savedAt
            ? 'Saved — save again'
            : 'Save slides'}
        </button>
      </footer>
    </div>
  );
};

export default SlidesEditor;
