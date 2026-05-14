// Authoring UI for an AI-generated lesson plan.
//
// The author writes a single free-text prompt ("create a 5-checkpoint
// lesson on loops using Music Lab and Web Lab 2", etc.).  Pressing
// Generate calls the AI Gateway with a structured-output schema and
// fills in the entire LessonPlan in one shot — title, introduction,
// checkpoint list, lab type assignments, instructions, success
// criteria, and panel captions.  Everything in the generated plan is
// then editable inline before saving.

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React, {useState} from 'react';

import {createLesson, updateLesson} from './api';
import {generateLessonFromPrompt} from './lessonGenerator';
import {generatePanelImage} from './panelImageGenerator';
import {Checkpoint, LabType, LessonPlan, PanelSlide} from './types';

import styles from './aiLessons.module.scss';

const LAB_ITEMS = [
  {value: 'weblab2', text: 'Web Lab 2'},
  {value: 'music', text: 'Music Lab'},
  {value: 'panels', text: 'Panels (instructional slides)'},
];

interface AuthorPageProps {
  mode: 'new' | 'edit';
  lessonId?: string;
  initialLesson?: LessonPlan;
}

function newCheckpoint(): Checkpoint {
  return {
    id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    title: 'New checkpoint',
    description: '',
    labType: 'panels',
    successCriteria: '',
    panels: [{caption: ''}],
  };
}

const AuthorPage: React.FunctionComponent<AuthorPageProps> = ({
  mode,
  lessonId,
  initialLesson,
}) => {
  const [prompt, setPrompt] = useState<string>(
    initialLesson?.authorInputs?.prompt || ''
  );
  const [plan, setPlan] = useState<LessonPlan | undefined>(initialLesson);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [savedId, setSavedId] = useState<string | undefined>(lessonId);
  // Per-slide image-generation state, keyed by `${checkpointIndex}-${panelIndex}`.
  const [generatingImageKey, setGeneratingImageKey] = useState<
    string | undefined
  >();
  // Human-readable description of what the page is currently working on.
  const [busyMessage, setBusyMessage] = useState<string | undefined>();

  // Auto-generate images for every panel slide in the freshly-generated plan,
  // in parallel.  Failures are caught per-slide so a single bad caption
  // doesn't sink the rest; affected slides just stay imageless and the
  // author can retry them manually.
  const populatePanelImages = async (
    id: string,
    seed: LessonPlan
  ): Promise<LessonPlan> => {
    const targets: {cpIndex: number; panelIndex: number; caption: string}[] =
      [];
    seed.checkpoints.forEach((cp, cpIndex) => {
      if (cp.labType !== 'panels') return;
      (cp.panels || []).forEach((panel, panelIndex) => {
        if (panel.caption.trim() && !panel.imageUrl) {
          targets.push({cpIndex, panelIndex, caption: panel.caption});
        }
      });
    });

    if (targets.length === 0) return seed;

    const total = targets.length;
    let completed = 0;
    setBusyMessage(`Generating slide images (0 of ${total})…`);

    const results = await Promise.all(
      targets.map(async target => {
        try {
          const url = await generatePanelImage(id, target.caption);
          completed++;
          setBusyMessage(`Generating slide images (${completed} of ${total})…`);
          return {...target, url};
        } catch {
          completed++;
          setBusyMessage(`Generating slide images (${completed} of ${total})…`);
          return {...target, url: undefined as string | undefined};
        }
      })
    );

    // Apply all results into the plan in one pass.
    const checkpoints = seed.checkpoints.map(cp => ({
      ...cp,
      panels: cp.panels ? [...cp.panels] : cp.panels,
    }));
    for (const result of results) {
      if (!result.url) continue;
      const cp = checkpoints[result.cpIndex];
      if (!cp.panels) continue;
      cp.panels[result.panelIndex] = {
        ...cp.panels[result.panelIndex],
        imageUrl: result.url,
      };
    }
    return {...seed, checkpoints};
  };

  const handleGenerate = async () => {
    setBusy(true);
    setError(undefined);
    setBusyMessage('Generating lesson plan…');
    try {
      if (!prompt.trim()) {
        throw new Error('Please describe the lesson you want to create.');
      }
      const generated = await generateLessonFromPrompt(prompt);
      setPlan(generated);

      // Persist immediately so image uploads have a lessonId to scope to;
      // re-use the existing savedId if the author is regenerating.
      setBusyMessage('Saving draft…');
      let id = savedId;
      const draftToSave: LessonPlan = {
        ...generated,
        authorInputs: {prompt: prompt.trim()},
      };
      if (id) {
        await updateLesson(id, draftToSave);
      } else {
        id = await createLesson(draftToSave);
        setSavedId(id);
      }

      const withImages = await populatePanelImages(id, generated);
      setPlan(withImages);
      if (withImages !== generated) {
        setBusyMessage('Saving images…');
        await updateLesson(id, {
          ...withImages,
          authorInputs: {prompt: prompt.trim()},
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setBusyMessage(undefined);
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setBusy(true);
    setError(undefined);
    try {
      const planToSave: LessonPlan = {
        ...plan,
        authorInputs: {prompt: prompt.trim()},
      };
      if (savedId) {
        await updateLesson(savedId, planToSave);
      } else {
        const id = await createLesson(planToSave);
        setSavedId(id);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // ---- helpers for editing the plan in place ----

  const updatePlan = (patch: Partial<LessonPlan>) =>
    setPlan(p => (p ? {...p, ...patch} : p));

  const updateCheckpoint = (i: number, patch: Partial<Checkpoint>) =>
    setPlan(p =>
      p
        ? {
            ...p,
            checkpoints: p.checkpoints.map((c, idx) =>
              idx === i ? {...c, ...patch} : c
            ),
          }
        : p
    );

  const removeCheckpoint = (i: number) =>
    setPlan(p =>
      p ? {...p, checkpoints: p.checkpoints.filter((_, idx) => idx !== i)} : p
    );

  const addCheckpoint = () =>
    setPlan(p =>
      p ? {...p, checkpoints: [...p.checkpoints, newCheckpoint()]} : p
    );

  const updatePanel = (
    cpIndex: number,
    panelIndex: number,
    patch: Partial<PanelSlide>
  ) =>
    setPlan(p => {
      if (!p) return p;
      const cp = p.checkpoints[cpIndex];
      const panels = [...(cp.panels || [])];
      panels[panelIndex] = {...panels[panelIndex], ...patch};
      return {
        ...p,
        checkpoints: p.checkpoints.map((c, idx) =>
          idx === cpIndex ? {...c, panels} : c
        ),
      };
    });

  const addPanel = (cpIndex: number) =>
    setPlan(p => {
      if (!p) return p;
      const cp = p.checkpoints[cpIndex];
      const panels: PanelSlide[] = [...(cp.panels || []), {caption: ''}];
      return {
        ...p,
        checkpoints: p.checkpoints.map((c, idx) =>
          idx === cpIndex ? {...c, panels} : c
        ),
      };
    });

  const removePanel = (cpIndex: number, panelIndex: number) =>
    setPlan(p => {
      if (!p) return p;
      const cp = p.checkpoints[cpIndex];
      const panels = (cp.panels || []).filter((_, i) => i !== panelIndex);
      return {
        ...p,
        checkpoints: p.checkpoints.map((c, idx) =>
          idx === cpIndex ? {...c, panels} : c
        ),
      };
    });

  const handleGenerateImage = async (
    cpIndex: number,
    panelIndex: number,
    caption: string
  ) => {
    if (!savedId) {
      setError(
        'Save the lesson first so generated images can be stored alongside it.'
      );
      return;
    }
    const key = `${cpIndex}-${panelIndex}`;
    setGeneratingImageKey(key);
    setError(undefined);
    try {
      const url = await generatePanelImage(savedId, caption);
      updatePanel(cpIndex, panelIndex, {imageUrl: url});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGeneratingImageKey(prev => (prev === key ? undefined : prev));
    }
  };

  const renderSlideEditor = (
    cpIndex: number,
    panelIndex: number,
    panel: PanelSlide
  ) => {
    const key = `${cpIndex}-${panelIndex}`;
    const isGenerating = generatingImageKey === key;
    return (
      <li key={panelIndex} className={styles.checkpointInput}>
        <div className={styles.checkpointRow}>
          <strong>Slide {panelIndex + 1}</strong>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => removePanel(cpIndex, panelIndex)}
            disabled={(plan?.checkpoints[cpIndex].panels || []).length <= 1}
            aria-label={`Remove slide ${panelIndex + 1}`}
          >
            Remove
          </button>
        </div>
        <label className={styles.field}>
          <span>Caption</span>
          <textarea
            value={panel.caption}
            onChange={e =>
              updatePanel(cpIndex, panelIndex, {caption: e.target.value})
            }
            rows={2}
          />
        </label>
        <label className={styles.field}>
          <span>Image URL</span>
          <input
            type="text"
            value={panel.imageUrl || ''}
            onChange={e =>
              updatePanel(cpIndex, panelIndex, {imageUrl: e.target.value})
            }
            placeholder="Generate one below, or paste a URL."
          />
        </label>
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt=""
            style={{
              maxWidth: 240,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.1)',
              marginBottom: 8,
            }}
          />
        ) : null}
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() =>
            handleGenerateImage(cpIndex, panelIndex, panel.caption)
          }
          disabled={
            isGenerating ||
            !!generatingImageKey ||
            !panel.caption.trim() ||
            !savedId
          }
          title={
            !savedId
              ? 'Save the lesson first to generate images'
              : !panel.caption.trim()
              ? 'Write a caption first'
              : 'Generate an illustration with Gemini'
          }
        >
          {isGenerating
            ? 'Generating image…'
            : panel.imageUrl
            ? 'Regenerate image'
            : 'Generate image'}
        </button>
      </li>
    );
  };

  return (
    <div className={styles.authorPage}>
      <header className={styles.authorHeader}>
        <h1>{mode === 'edit' ? 'Edit AI Lesson' : 'Author a new AI Lesson'}</h1>
        <p className={styles.muted}>
          Describe the lesson you want in one paragraph. The AI fills in
          everything — checkpoints, lab types, instructions, success criteria,
          and slide captions — and you can tweak any of it before saving.
        </p>
      </header>

      <section className={styles.formSection}>
        <label className={styles.field}>
          <span>Lesson prompt</span>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={5}
            placeholder="e.g. Create a 5–6 checkpoint lesson for middle schoolers that teaches loops and conditionals. Start with a panels intro, then build a looping song in Music Lab, then have students use a conditional in Web Lab 2 to change a page's style. End with a recap panel."
          />
        </label>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleGenerate}
            disabled={busy}
          >
            {busy
              ? busyMessage || 'Working…'
              : plan
              ? 'Regenerate from prompt'
              : 'Generate lesson plan'}
          </button>
        </div>
        {busy && busyMessage && (
          <div className={styles.muted} style={{fontSize: 13, marginTop: 8}}>
            {busyMessage}
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </section>

      {plan && (
        <section className={styles.previewSection}>
          <h2>Lesson</h2>

          <label className={styles.field}>
            <span>Title</span>
            <input
              type="text"
              value={plan.title}
              onChange={e => updatePlan({title: e.target.value})}
            />
          </label>

          <label className={styles.field}>
            <span>Objective</span>
            <textarea
              value={plan.objective}
              onChange={e => updatePlan({objective: e.target.value})}
              rows={2}
            />
          </label>

          <h2>Checkpoints</h2>
          <ol className={styles.checkpointList}>
            {plan.checkpoints.map((cp, i) => (
              <li key={cp.id} className={styles.checkpointInput}>
                <div className={styles.checkpointRow}>
                  <strong>#{i + 1}</strong>
                  <SimpleDropdown
                    name={`checkpoint-${i}-lab-type`}
                    labelText="Lab type"
                    isLabelVisible={false}
                    size="s"
                    color="black"
                    items={LAB_ITEMS}
                    selectedValue={cp.labType}
                    onChange={e =>
                      updateCheckpoint(i, {
                        labType: e.target.value as LabType,
                      })
                    }
                  />
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => removeCheckpoint(i)}
                    aria-label={`Remove checkpoint ${i + 1}`}
                  >
                    Remove
                  </button>
                </div>

                <label className={styles.field}>
                  <span>Title</span>
                  <input
                    type="text"
                    value={cp.title}
                    onChange={e => updateCheckpoint(i, {title: e.target.value})}
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    Description — what the student should do and any context the
                    AI Tutor needs. Never shown verbatim; the tutor paraphrases
                    on the fly.
                  </span>
                  <textarea
                    value={cp.description}
                    onChange={e =>
                      updateCheckpoint(i, {description: e.target.value})
                    }
                    rows={4}
                  />
                </label>

                <label className={styles.field}>
                  <span>Success criteria (what the AI Tutor checks)</span>
                  <textarea
                    value={cp.successCriteria}
                    onChange={e =>
                      updateCheckpoint(i, {successCriteria: e.target.value})
                    }
                    rows={2}
                  />
                </label>

                {cp.labType === 'panels' && (
                  <div className={styles.field}>
                    <span>Slide captions</span>
                    <ol className={styles.checkpointList}>
                      {(cp.panels || []).map((p, pi) =>
                        renderSlideEditor(i, pi, p)
                      )}
                    </ol>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => addPanel(i)}
                    >
                      + Add slide
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={addCheckpoint}
          >
            + Add checkpoint
          </button>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSave}
              disabled={busy}
            >
              {busy ? 'Saving…' : savedId ? 'Save changes' : 'Save lesson'}
            </button>
            {savedId && (
              <a
                className={styles.secondaryButton}
                href={`/ai_lessons/${savedId}`}
              >
                Open student view →
              </a>
            )}
            <a className={styles.linkButton} href="/ai_lessons">
              Back to list
            </a>
          </div>
        </section>
      )}
    </div>
  );
};

export default AuthorPage;
