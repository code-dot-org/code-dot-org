import React, {useCallback, useEffect, useMemo, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {LevelPropertiesMap} from '@cdo/apps/lab2/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {loadLessonLevelProperties} from '../lesson-generator/levelApi';

import {generateSlide} from './ai/slide';
import {generateSlidesOutline} from './ai/slidesOutline';
import SlideCard from './components/SlideCard';
import SlidesOutlineBlock from './components/SlidesOutlineBlock';
import SlidesProgressDialog from './components/SlidesProgressDialog';
import SlidesSummaryDialog from './components/SlidesSummaryDialog';
import {buildInitialState, newSlideSpec} from './helpers/buildInitialState';
import {saveSlidesData} from './slidesApi';
import {
  ExistingLessonData,
  PersistedSlide,
  SlidesGenerationSummary,
  SlidesProgressUpdate,
  SlideSpec,
} from './types';

import moduleStyles from './lesson-slides-generator.module.scss';

interface LessonSlidesGeneratorProps {
  lesson: ExistingLessonData;
}

const LessonSlidesGenerator: React.FC<LessonSlidesGeneratorProps> = ({
  lesson,
}) => {
  const initial = useMemo(() => buildInitialState(lesson), [lesson]);
  const [slideSpecs, setSlideSpecs] = useState<SlideSpec[]>(initial);
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

  // Borrow the AI_CHAT_LAB context so generateText passes its access
  // check, same as the lesson generator on the parent branch.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.AI_CHAT_LAB,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
      lessonId: lesson.id,
    });
  }, [lesson.id]);

  // Block accidental navigation while generation is in progress.
  useEffect(() => {
    if (!isGenerating) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isGenerating]);

  const updateSpec = useCallback((key: string, patch: Partial<SlideSpec>) => {
    setSlideSpecs(specs =>
      specs.map(s => {
        if (s.key !== key) return s;
        const next = {...s, ...patch};
        // Same logic as the parent branch's lesson generator: editing a
        // description re-derives the `generate` checkbox from whether
        // the description still matches what we last generated for. The
        // user can still override manually after.
        if ('description' in patch) {
          next.generate =
            next.lastGeneratedDescription === undefined ||
            next.description.trim() !== next.lastGeneratedDescription;
        }
        return next;
      })
    );
  }, []);

  const removeSpec = useCallback((key: string) => {
    setSlideSpecs(specs => specs.filter(s => s.key !== key));
  }, []);

  const moveSpec = useCallback((key: string, direction: 'up' | 'down') => {
    setSlideSpecs(specs => {
      const i = specs.findIndex(s => s.key === key);
      if (i === -1) return specs;
      const t = direction === 'up' ? i - 1 : i + 1;
      if (t < 0 || t >= specs.length) return specs;
      const next = [...specs];
      [next[i], next[t]] = [next[t], next[i]];
      return next;
    });
  }, []);

  const addSpec = useCallback(() => {
    setSlideSpecs(specs => [...specs, newSlideSpec()]);
  }, []);

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

      const planned = await generateSlidesOutline(
        lesson.name,
        outline.trim() || undefined,
        levelPropertiesById
      );
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
  }, [lesson.id, lesson.name, outline]);

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
      // panel. The flow lets the user keep an existing panel intact.
      if (!spec.generate && spec.panel) {
        appendLog(`Slide ${i + 1}: keeping existing panel.`);
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
        const panel = await generateSlide(lesson.name, i, description);
        finalSpecs[i] = {
          ...spec,
          panel,
          generate: false,
          lastGeneratedDescription: description,
        };
        generated.push({key: spec.key, description});
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
  }, [slideSpecs, lesson.id, lesson.name, outline, appendLog]);

  return (
    <div className={moduleStyles.container}>
      <h1 className={moduleStyles.heading}>
        Generate slides for "{lesson.name}"
      </h1>
      <p className={moduleStyles.subheading}>
        Plan a sequence of intro slides shown to students before they start this
        lesson. Each card describes what should be on a slide; clicking Generate
        Slides turns each one into a Panels-app panel (image + overlay text) and
        writes them all to <code>{lesson.slidesFilePath}</code>.
      </p>

      <SlidesOutlineBlock
        value={outline}
        onChange={setOutline}
        onGenerate={handleGenerateOutline}
        isOutlining={isOutlining}
        disabled={isGenerating}
        error={outlineError}
      />

      <div className={moduleStyles.slideList}>
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

      <div className={moduleStyles.addButtonRow}>
        <button
          type="button"
          className={moduleStyles.secondaryButton}
          onClick={addSpec}
          disabled={isGenerating}
        >
          + Add slide
        </button>
      </div>

      {topLevelError && (
        <p className={moduleStyles.summaryBad} role="alert">
          {topLevelError}
        </p>
      )}

      <footer className={moduleStyles.footer}>
        <a href={lesson.editLessonUrl} className={moduleStyles.secondaryButton}>
          Back to lesson edit
        </a>
        <a href={lesson.slidesUrl} className={moduleStyles.secondaryButton}>
          View slides
        </a>
        <button
          type="button"
          className={moduleStyles.primaryButton}
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
