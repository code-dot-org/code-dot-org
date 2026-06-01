import React, {useCallback, useMemo, useState} from 'react';

import {createUuid} from '@cdo/apps/utils';

import OutlineBlock from '../curriculum-generator/components/OutlineBlock';
import {useAichatContext} from '../curriculum-generator/hooks/useAichatContext';
import {useBeforeUnloadWhile} from '../curriculum-generator/hooks/useBeforeUnloadWhile';
import {useReorderableList} from '../curriculum-generator/hooks/useReorderableList';

import {generateUnitOutline} from './ai/unitOutline';
import LessonCard from './components/LessonCard';
import UnitGenerateDialog from './components/UnitGenerateDialog';
import {
  buildInitialState,
  keyFromName,
  newLessonSpec,
} from './helpers/buildInitialState';
import {ExistingUnitData, LessonSpec, UnitGenerationSummary} from './types';
import {LessonOutlinePayload, saveLessonOutlines} from './unitApi';

import sharedStyles from '../curriculum-generator/curriculum-generator.module.scss';

interface UnitGeneratorProps {
  unit: ExistingUnitData;
}

const UnitGenerator: React.FC<UnitGeneratorProps> = ({unit}) => {
  const initial = useMemo(() => buildInitialState(unit), [unit]);
  const {
    specs: lessonSpecs,
    setSpecs: setLessonSpecs,
    updateSpec,
    removeSpec,
    moveSpec,
    addSpec,
  } = useReorderableList<LessonSpec>({
    initial,
    getKey: s => s.reactKey,
    newSpec: newLessonSpec,
    // Auto-derive key from name on a new card while the key still looks
    // auto-generated (or empty). Once the user edits the key explicitly,
    // we stop overwriting it.
    onAfterPatch: (prev, next, patch) => {
      if (!('name' in patch)) return next;
      if (prev.id !== undefined) return next;
      if (prev.key !== '' && prev.key !== keyFromName(prev.name)) return next;
      return {...next, key: keyFromName(next.name)};
    },
  });
  const [outline, setOutline] = useState<string>(unit.generateOutline || '');
  const [isOutlining, setIsOutlining] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState<UnitGenerationSummary | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  useAichatContext({scriptId: unit.id});
  useBeforeUnloadWhile(isSaving);

  const handleGenerateOutline = useCallback(async () => {
    if (!outline.trim()) {
      setOutlineError('Type an outline first.');
      return;
    }
    setOutlineError(null);
    setIsOutlining(true);
    try {
      const planned = await generateUnitOutline({
        unitName: unit.title,
        unitOutline: outline.trim(),
      });
      const newSpecs: LessonSpec[] = planned.map(l => ({
        reactKey: createUuid(),
        key: l.key,
        name: l.name,
        generateOutline: l.description,
      }));
      // Drop any blank brand-new rows (placeholders) before appending the
      // AI plan, so a fresh page replaces an empty starter card cleanly.
      // Existing lessons (id set) and rows with content are kept.
      setLessonSpecs(prev => {
        const kept = prev.filter(s => {
          if (s.id !== undefined) return true;
          return !!(s.key.trim() || s.name.trim() || s.generateOutline.trim());
        });
        return [...kept, ...newSpecs];
      });
    } catch (err) {
      setOutlineError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsOutlining(false);
    }
  }, [outline, unit.title, setLessonSpecs]);

  const validationError = useMemo(() => {
    if (lessonSpecs.length === 0) return 'Add at least one lesson.';
    // Match what the server actually requires: non-blank name + key, and
    // unique keys within the unit (the Lesson model enforces a uniqueness
    // index on (script_id, key)). No format constraint — legacy lessons
    // routinely have spaces or arbitrary characters in their keys, and
    // imposing a kebab-case rule here blocks saves on units that include
    // them even though the user can't edit those keys from this page.
    const seenKeys = new Set<string>();
    for (const spec of lessonSpecs) {
      if (!spec.name.trim()) return 'Every lesson needs a name.';
      if (!spec.key.trim()) return 'Every lesson needs a key.';
      const k = spec.key.trim();
      if (seenKeys.has(k)) return `Duplicate lesson key: ${k}`;
      seenKeys.add(k);
    }
    return null;
  }, [lessonSpecs]);

  const handleGenerateLessons = useCallback(async () => {
    if (validationError) {
      setTopLevelError(validationError);
      return;
    }
    if (unit.multipleLessonGroups) {
      setTopLevelError(
        'This unit has multiple lesson groups; saving from this page is disabled. Use the unit editor instead.'
      );
      return;
    }
    setTopLevelError(null);
    setSaveError(null);
    setSummary(null);
    setIsSaving(true);

    const payload: LessonOutlinePayload[] = lessonSpecs.map(s => {
      const entry: LessonOutlinePayload = {
        key: s.key.trim(),
        name: s.name.trim(),
      };
      if (s.id !== undefined) entry.id = s.id;
      // Only send generateOutline when it differs from what we loaded —
      // a no-op save shouldn't clear an existing outline by accident on
      // a card the user didn't touch.
      const next = s.generateOutline.trim();
      const original = (s.originalGenerateOutline ?? '').trim();
      if (s.id === undefined || next !== original) {
        entry.generateOutline = next;
      }
      return entry;
    });

    try {
      // Always send the outline alongside lessons so a cleared-then-saved
      // outline actually clears on the server. The empty string is the
      // signal for "no outline"; the server treats anything (including '')
      // as an explicit overwrite.
      const result = await saveLessonOutlines(
        unit.editUnitUrl,
        payload,
        outline.trim()
      );
      // Pair the server's freshly-saved Lesson rows back to the spec list
      // by key, so the success dialog can show paths even for newly-created
      // lessons (whose ids we didn't have before this round-trip).
      const byKey = new Map(result.lessons.map(l => [l.key, l]));
      const summaryLessons = lessonSpecs.map(s => {
        const saved = byKey.get(s.key.trim());
        return {
          name: s.name.trim(),
          lessonGeneratePath: saved?.lessonGeneratePath || '',
          lessonEditPath: saved?.lessonEditPath || '',
          createdSeparately: !!s.createdSeparately,
          isNew: s.id === undefined,
        };
      });
      setSummary({lessons: summaryLessons, total: summaryLessons.length});
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  }, [validationError, lessonSpecs, unit, outline]);

  const dialogOpen = isSaving || summary !== null || saveError !== null;
  const totalToSave = lessonSpecs.length;

  return (
    <div className={sharedStyles.container}>
      <h1 className={sharedStyles.heading}>
        Generate lessons for "{unit.title}"
      </h1>
      <p className={sharedStyles.subheading}>
        Plan the lessons in this unit. Each lesson gets a name, a key, and a
        prompt that the per-lesson <code>/generate</code> page will later use to
        write its content. Existing lessons appear here too — edit their prompts
        or reorder them.
      </p>

      {unit.multipleLessonGroups && (
        <p className={sharedStyles.summaryBad} role="alert">
          This unit has multiple lesson groups. Saving from this page is
          disabled — the bulk-edit path doesn't know which group new lessons
          belong in. Use the unit editor instead, or split the unit first.
        </p>
      )}

      <OutlineBlock
        heading="Optional: generate the lessons below from a unit outline"
        helpText="Describe the unit as a whole — what it teaches, who it's for, what the student should be able to do by the end. The AI will turn that into a sequence of lessons with names, keys, and per-lesson prompts. You can edit, reorder, or remove any of them before saving."
        placeholder="e.g. A 6-lesson intro to web development for middle schoolers. Start with HTML structure, then visual styling with CSS, then a small project where students build a personal homepage."
        buttonLabel="Generate lesson outlines"
        value={outline}
        onChange={setOutline}
        onGenerate={handleGenerateOutline}
        isOutlining={isOutlining}
        disabled={isSaving}
        error={outlineError}
      />

      <div className={sharedStyles.cardList}>
        {lessonSpecs.map((spec, index) => (
          <LessonCard
            key={spec.reactKey}
            spec={spec}
            index={index}
            total={lessonSpecs.length}
            disabled={isSaving}
            onChange={updateSpec}
            onRemove={removeSpec}
            onMove={moveSpec}
          />
        ))}
      </div>

      <div className={sharedStyles.addButtonRow}>
        <button
          type="button"
          className={sharedStyles.secondaryButton}
          onClick={addSpec}
          disabled={isSaving}
        >
          + Add lesson
        </button>
      </div>

      {topLevelError && (
        <p className={sharedStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={sharedStyles.footer}>
        <a href={unit.editUnitUrl} className={sharedStyles.secondaryButton}>
          Back to unit editor
        </a>
        <button
          type="button"
          className={sharedStyles.primaryButton}
          onClick={handleGenerateLessons}
          // Don't gate the button on validation — empty/invalid cards
          // are common while the user is mid-typing, and the optional
          // AI outline step shouldn't be a precondition. The click
          // handler validates and surfaces a clear error inline.
          disabled={isSaving || unit.multipleLessonGroups}
          title={validationError || ''}
        >
          {isSaving ? 'Saving…' : 'Generate Lessons'}
        </button>
      </footer>

      {dialogOpen && (
        <UnitGenerateDialog
          isSaving={isSaving}
          totalToSave={totalToSave}
          summary={summary}
          error={saveError}
          editUnitUrl={unit.editUnitUrl}
          onClose={() => {
            setSummary(null);
            setSaveError(null);
          }}
        />
      )}
    </div>
  );
};

export default UnitGenerator;
