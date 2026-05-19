import React, {useCallback, useEffect, useMemo, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {generateUnitOutline} from './ai/unitOutline';
import LessonCard from './components/LessonCard';
import UnitGenerateDialog from './components/UnitGenerateDialog';
import UnitOutlineBlock from './components/UnitOutlineBlock';
import {
  buildInitialState,
  keyFromName,
  newLessonSpec,
} from './helpers/buildInitialState';
import {ExistingUnitData, LessonSpec, UnitGenerationSummary} from './types';
import {LessonOutlinePayload, saveLessonOutlines} from './unitApi';

import moduleStyles from './unit-generator.module.scss';

interface UnitGeneratorProps {
  unit: ExistingUnitData;
}

const UnitGenerator: React.FC<UnitGeneratorProps> = ({unit}) => {
  const initial = useMemo(() => buildInitialState(unit), [unit]);
  const [lessonSpecs, setLessonSpecs] = useState<LessonSpec[]>(initial);
  const [outline, setOutline] = useState<string>(unit.generateOutline || '');
  const [isOutlining, setIsOutlining] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [summary, setSummary] = useState<UnitGenerationSummary | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  // The aichat gateway expects a context on every access-token request.
  // We're not actually inside an aichat lab, but the lesson generator
  // page does the same thing: borrow the AI_CHAT_LAB context so the
  // generateText path passes its access check.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: null,
      scriptId: unit.id,
      channelId: undefined,
      lessonId: undefined,
    });
  }, [unit.id]);

  // Block accidental navigation while a save is in flight.
  useEffect(() => {
    if (!isSaving) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSaving]);

  const updateSpec = useCallback(
    (reactKey: string, patch: Partial<LessonSpec>) => {
      setLessonSpecs(specs =>
        specs.map(s => {
          if (s.reactKey !== reactKey) return s;
          const next = {...s, ...patch};
          // Auto-derive key from name on a new card while the key still
          // looks auto-generated (or empty). Once the user edits the key
          // explicitly, we stop overwriting it.
          if (
            'name' in patch &&
            s.id === undefined &&
            (s.key === '' || s.key === keyFromName(s.name))
          ) {
            next.key = keyFromName(next.name);
          }
          return next;
        })
      );
    },
    []
  );

  const removeSpec = useCallback((reactKey: string) => {
    setLessonSpecs(specs => specs.filter(s => s.reactKey !== reactKey));
  }, []);

  const moveSpec = useCallback((reactKey: string, direction: 'up' | 'down') => {
    setLessonSpecs(specs => {
      const i = specs.findIndex(s => s.reactKey === reactKey);
      if (i === -1) return specs;
      const t = direction === 'up' ? i - 1 : i + 1;
      if (t < 0 || t >= specs.length) return specs;
      const next = [...specs];
      [next[i], next[t]] = [next[t], next[i]];
      return next;
    });
  }, []);

  const addSpec = useCallback(() => {
    setLessonSpecs(specs => [...specs, newLessonSpec()]);
  }, []);

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
  }, [outline, unit.title]);

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
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.heading}>
        Generate lessons for "{unit.title}"
      </h1>
      <p className={moduleStyles.subheading}>
        Plan the lessons in this unit. Each lesson gets a name, a key, and a
        prompt that the per-lesson <code>/generate</code> page will later use to
        write its content. Existing lessons appear here too — edit their prompts
        or reorder them.
      </p>

      {unit.multipleLessonGroups && (
        <p className={moduleStyles.summaryBad} role="alert">
          This unit has multiple lesson groups. Saving from this page is
          disabled — the bulk-edit path doesn't know which group new lessons
          belong in. Use the unit editor instead, or split the unit first.
        </p>
      )}

      <UnitOutlineBlock
        value={outline}
        onChange={setOutline}
        onGenerate={handleGenerateOutline}
        isOutlining={isOutlining}
        disabled={isSaving}
        error={outlineError}
        defaultOpen={!!(unit.generateOutline || '').trim()}
      />

      <div className={moduleStyles.lessonList}>
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

      <div className={moduleStyles.addButtonRow}>
        <button
          type="button"
          className={moduleStyles.secondaryButton}
          onClick={addSpec}
          disabled={isSaving}
        >
          + Add lesson
        </button>
      </div>

      {topLevelError && (
        <p className={moduleStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={moduleStyles.footer}>
        <a href={unit.editUnitUrl} className={moduleStyles.secondaryButton}>
          Back to unit editor
        </a>
        <button
          type="button"
          className={moduleStyles.primaryButton}
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
