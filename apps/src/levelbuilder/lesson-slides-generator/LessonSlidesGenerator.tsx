import React, {useCallback, useMemo, useState} from 'react';

import {LevelPropertiesMap} from '@cdo/apps/lab2/types';

import OutlineBlock from '../curriculum-generator/components/OutlineBlock';
import {useAichatContext} from '../curriculum-generator/hooks/useAichatContext';
import {useBeforeUnloadWhile} from '../curriculum-generator/hooks/useBeforeUnloadWhile';
import {useReorderableList} from '../curriculum-generator/hooks/useReorderableList';
import {loadLessonLevelProperties} from '../lesson-generator/levelApi';

import {generateSlide} from './ai/slide';
import {generateSlidesOutline} from './ai/slidesOutline';
import SlideCard from './components/SlideCard';
import SlidesProgressDialog from './components/SlidesProgressDialog';
import SlidesSummaryDialog from './components/SlidesSummaryDialog';
import {buildInitialState, newSlideSpec} from './helpers/buildInitialState';
import {formatPrecedingSlides, PriorSlide} from './helpers/precedingSlides';
import {saveSlidesData} from './slidesApi';
import {
  ExistingLessonData,
  PersistedSlide,
  SlidesGenerationSummary,
  SlidesProgressUpdate,
  SlideSpec,
} from './types';

import sharedStyles from '../curriculum-generator/curriculum-generator.module.scss';

interface LessonSlidesGeneratorProps {
  lesson: ExistingLessonData;
}

const LessonSlidesGenerator: React.FC<LessonSlidesGeneratorProps> = ({
  lesson,
}) => {
  const initial = useMemo(() => buildInitialState(lesson), [lesson]);
  const {
    specs: slideSpecs,
    setSpecs: setSlideSpecs,
    updateSpec,
    removeSpec,
    moveSpec,
    addSpec,
  } = useReorderableList<SlideSpec>({
    initial,
    getKey: s => s.key,
    newSpec: newSlideSpec,
    // Same logic as the lesson generator: editing the description
    // re-derives the `generate` checkbox from whether the description
    // still matches what we last generated for. The user can still
    // override manually after.
    onAfterPatch: (_prev, next, patch) => {
      if (!('description' in patch)) return next;
      return {
        ...next,
        generate:
          next.lastGeneratedDescription === undefined ||
          next.description.trim() !== next.lastGeneratedDescription,
      };
    },
  });
  const [outline, setOutline] = useState<string>(
    lesson.generateSlidesOutline || ''
  );
  const [isOutlining, setIsOutlining] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SlidesProgressUpdate | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [summary, setSummary] = useState<SlidesGenerationSummary | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  useAichatContext({lessonId: lesson.id});
  useBeforeUnloadWhile(isGenerating);

  const appendLog = useCallback((line: string) => {
    setProgressLog(log => [...log, line]);
  }, []);

  const handleGenerateOutline = useCallback(async () => {
    setOutlineError(null);
    setIsOutlining(true);
    try {
      // Always fetch fresh lesson level content. The /generate page
      // changes levels frequently, and stale context here would produce
      // misaligned slides.
      let levelPropertiesById: LevelPropertiesMap = {};
      try {
        levelPropertiesById = await loadLessonLevelProperties(lesson.id);
      } catch (err) {
        // Soft-fail: we'll still ask the model for an outline using just
        // the user's prompt. Better than blocking the user on a context
        // round-trip.
        const message = err instanceof Error ? err.message : String(err);
        setOutlineError(`Couldn't load lesson levels: ${message}. Continuing.`);
      }

      const planned = await generateSlidesOutline({
        unitName: lesson.unitName,
        unitOutline: lesson.unitOutline ?? undefined,
        lessonName: lesson.name,
        lessonOutline: lesson.generateOutline ?? undefined,
        slidesOutline: outline.trim() || undefined,
        levelContents: JSON.stringify(levelPropertiesById, null, 2),
      });
      const newSpecs: SlideSpec[] = planned.map(s => ({
        ...newSlideSpec(),
        description: s.description,
        generate: true,
      }));
      // Drop any blank brand-new rows the user hasn't touched, then
      // append the AI plan.
      setSlideSpecs(prev => {
        const kept = prev.filter(s => !!(s.description.trim() || s.panel));
        return [...kept, ...newSpecs];
      });
    } catch (err) {
      setOutlineError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsOutlining(false);
    }
  }, [
    lesson.id,
    lesson.name,
    lesson.unitName,
    lesson.unitOutline,
    lesson.generateOutline,
    outline,
    setSlideSpecs,
  ]);

  const handleGenerateSlides = useCallback(async () => {
    setTopLevelError(null);
    setSummary(null);
    setProgressLog([]);
    setIsGenerating(true);

    const generated: SlidesGenerationSummary['generated'] = [];
    const failed: SlidesGenerationSummary['failed'] = [];
    // Final list to write to slides.json — captured during the loop and
    // sent in one PUT at the end (so a single rejected slide doesn't
    // wipe the others' work).
    const finalSpecs: SlideSpec[] = [...slideSpecs];

    // Build the page-scope context once. Each per-slide call narrows
    // this to a SlideContext by adding slideIndex, slideDescription,
    // and a sibling-forward precedingSlides summary.
    const slidesPageCtx = {
      unitName: lesson.unitName,
      unitOutline: lesson.unitOutline ?? undefined,
      lessonName: lesson.name,
      lessonOutline: lesson.generateOutline ?? undefined,
      slidesOutline: outline.trim() || undefined,
    };

    // Running sibling-forward summary. Includes every slide we either
    // just generated or that already had a panel; cards we skip
    // entirely (empty description) don't contribute, since they have
    // nothing for the next slide to build on.
    const priorSlides: PriorSlide[] = [];

    for (let i = 0; i < slideSpecs.length; i++) {
      const spec = slideSpecs[i];
      const description = spec.description.trim();

      // Skip cards with no description regardless of the Generate flag —
      // the AI has nothing to work with.
      if (!description) {
        appendLog(`Slide ${i + 1}: skipping (no description).`);
        continue;
      }

      // Skip cards whose Generate flag is off and that already have a
      // panel. The flow lets the user keep an existing panel intact —
      // but we still feed its content into the precedingSlides context
      // so later slides see the deck as it will actually render.
      if (!spec.generate && spec.panel) {
        appendLog(`Slide ${i + 1}: keeping existing panel.`);
        priorSlides.push({
          position: i + 1,
          description,
          panel: spec.panel,
        });
        continue;
      }

      try {
        setProgress({
          slideIndex: i,
          totalSlides: slideSpecs.length,
          phase: 'planning',
        });
        appendLog(`Slide ${i + 1}: planning…`);
        // generateSlide internally moves through plan → image; we fire
        // an intermediate progress update right before the image step
        // since image generation is the long part.
        setProgress({
          slideIndex: i,
          totalSlides: slideSpecs.length,
          phase: 'generating-image',
        });
        appendLog(`Slide ${i + 1}: generating image…`);
        const precedingSlidesText = formatPrecedingSlides(priorSlides);
        const panel = await generateSlide({
          ...slidesPageCtx,
          slideIndex: i,
          slideDescription: description,
          precedingSlides: precedingSlidesText || undefined,
        });
        finalSpecs[i] = {
          ...spec,
          panel,
          generate: false,
          lastGeneratedDescription: description,
        };
        generated.push({key: spec.key, description});
        priorSlides.push({position: i + 1, description, panel});
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        appendLog(`Slide ${i + 1}: failed — ${message}`);
        failed.push({key: spec.key, description, error: message});
      }
    }

    // One save at the end. We always send the full ordered list so the
    // server's slides.json reflects current state, including any cards
    // with no panel yet (those round-trip back as `panel: null`).
    setProgress({
      slideIndex: slideSpecs.length - 1,
      totalSlides: slideSpecs.length,
      phase: 'saving',
    });
    appendLog('Saving slides.json…');
    try {
      const persisted: PersistedSlide[] = finalSpecs.map(s => ({
        key: s.key,
        description: s.description,
        panel: s.panel ?? null,
      }));
      await saveSlidesData(lesson.id, persisted, outline.trim());
      // Reflect the saved state back into the React tree so the cards
      // show their fresh panels (and their `generate` flags reset).
      setSlideSpecs(finalSpecs);
      appendLog('Done.');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      appendLog(`Save failed: ${message}`);
      setTopLevelError(`Couldn't save slides: ${message}`);
    }

    setSummary({generated, failed});
    setIsGenerating(false);
    setProgress(null);
  }, [
    slideSpecs,
    lesson.id,
    lesson.name,
    lesson.unitName,
    lesson.unitOutline,
    lesson.generateOutline,
    outline,
    appendLog,
    setSlideSpecs,
  ]);

  return (
    <div className={sharedStyles.container}>
      <h1 className={sharedStyles.heading}>
        Generate slides for "{lesson.name}"
      </h1>
      <p className={sharedStyles.subheading}>
        Plan a sequence of intro slides shown to students before they start this
        lesson. Each card describes what should be on a slide; clicking Generate
        Slides turns each one into a Panels-app panel (image + overlay text) and
        writes them all to <code>{lesson.slidesFilePath}</code>.
      </p>

      <OutlineBlock
        heading="Optional: describe what these intro slides should cover"
        helpText="These slides play before the lesson, to set context for the student. Describe what you want them to cover — themes, mood, concepts to set up — and the AI will read your existing lesson content and propose a sequence of slide cards. You can edit, reorder, or delete any of them before generating the actual panels."
        placeholder="e.g. Three slides that introduce HTML as the backbone of every webpage, motivate why structure matters, and hint at what the student will build today — without giving away the steps."
        buttonLabel="Generate slide outlines"
        value={outline}
        onChange={setOutline}
        onGenerate={handleGenerateOutline}
        isOutlining={isOutlining}
        disabled={isGenerating}
        error={outlineError}
      />

      <div className={sharedStyles.cardList}>
        {slideSpecs.map((spec, index) => (
          <SlideCard
            key={spec.key}
            spec={spec}
            index={index}
            total={slideSpecs.length}
            disabled={isGenerating}
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
          disabled={isGenerating}
        >
          + Add slide
        </button>
      </div>

      {topLevelError && (
        <p className={sharedStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={sharedStyles.footer}>
        <a href={lesson.editLessonUrl} className={sharedStyles.secondaryButton}>
          Back to lesson edit
        </a>
        <a href={lesson.slidesUrl} className={sharedStyles.secondaryButton}>
          View slides
        </a>
        <button
          type="button"
          className={sharedStyles.primaryButton}
          onClick={handleGenerateSlides}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating…' : 'Generate Slides'}
        </button>
      </footer>

      {(isGenerating || progress) && (
        <SlidesProgressDialog
          progress={progress}
          log={progressLog}
          isGenerating={isGenerating}
        />
      )}

      {summary && !isGenerating && (
        <SlidesSummaryDialog
          summary={summary}
          slidesUrl={lesson.slidesUrl}
          editLessonUrl={lesson.editLessonUrl}
          onClose={() => setSummary(null)}
        />
      )}
    </div>
  );
};

export default LessonSlidesGenerator;
