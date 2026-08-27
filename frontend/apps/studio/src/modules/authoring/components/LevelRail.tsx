import {Button, Typography} from '@mui/material';
import {useEffect, useState} from 'react';

import type {Experience, ExistingLevelExperience} from '@code-dot-org/authoring';

import {authoringApi, useLevelProperties} from '@/modules/authoring';

import type {UseLevelDraftResult} from '../levelDraft';

import {LevelCheckCard} from './ExperienceStage';
import OutlineRail from './OutlineRail';

import styles from './authoring.module.scss';

interface LevelRailProps {
  lessonId: string;
  experiences: Experience[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAskAiAt: (position: number) => void;
  active: Experience | undefined;
  /** The shared draft behind the right panel's visualization/toolbox/
   * workspace sections — see levelDraft.ts. undefined whenever the active
   * experience isn't a maze-family level (LessonPlayer only constructs one
   * for those). */
  levelDraft?: UseLevelDraftResult;
}

/**
 * Left rail — "Outline" and "Level" sibling tabs (Contentful's own
 * Components/Layers/Settings sibling-tab model, per the CMS-IA research at
 * docs/prototypes/author-mode-cms-ux-research.md). The Level tab holds LEVEL
 * METADATA ONLY (product owner's FINAL IA REVISION, 8/27, superseding an
 * earlier iteration that put the map/toolbox/workspace tools here too):
 * title, target block count, solution status, and Check level — the
 * Contentful page-Settings analog. The tools themselves moved to the right
 * properties panel's four click-selectable stage components
 * (PropertiesPanel.tsx) — a maze level decomposes into instructions,
 * visualization, toolbox, and workspace, each editing ITS OWN fields there.
 * BOTH tabs stay mounted (only one visible) so switching tabs never
 * discards an in-progress edit.
 */
export default function LevelRail({
  lessonId,
  experiences,
  activeIndex,
  onSelect,
  onAskAiAt,
  active,
  levelDraft,
}: LevelRailProps) {
  const [activeTab, setActiveTab] = useState<'outline' | 'level'>('outline');
  const levelNumericId =
    active?.kind === 'existingLevel' ? active.levelNumericId : undefined;
  const {data: properties} = useLevelProperties(levelNumericId ?? -1);
  const levelProps =
    levelNumericId !== undefined
      ? properties?.[String(levelNumericId)]
      : undefined;
  const appName = levelProps?.appName as string | undefined;
  const levelTabAvailable =
    active?.kind === 'existingLevel' &&
    appName === 'maze' &&
    levelNumericId !== undefined;

  // Falls back to Outline the moment the Level tab stops applying (the
  // author navigated to a non-maze experience via the top progress bubbles
  // while the Level tab was showing) — otherwise the tab bar would show a
  // selected-but-disabled Level tab with nothing under it.
  useEffect(() => {
    if (!levelTabAvailable && activeTab === 'level') {
      setActiveTab('outline');
    }
  }, [levelTabAvailable, activeTab]);

  return (
    <div className={styles.levelRailContainer}>
      <div className={styles.railTabs} role="tablist" aria-label="Left rail">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'outline'}
          className={
            activeTab === 'outline' ? styles.railTabActive : styles.railTab
          }
          onClick={() => setActiveTab('outline')}
        >
          Outline
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'level'}
          disabled={!levelTabAvailable}
          className={
            activeTab === 'level' ? styles.railTabActive : styles.railTab
          }
          onClick={() => setActiveTab('level')}
        >
          Level
        </button>
      </div>
      <div
        className={
          activeTab === 'outline' ? styles.railTabBody : styles.railTabBodyHidden
        }
      >
        <OutlineRail
          lessonId={lessonId}
          experiences={experiences}
          activeIndex={activeIndex}
          onSelect={onSelect}
          onAskAiAt={onAskAiAt}
        />
      </div>
      {levelTabAvailable &&
        active?.kind === 'existingLevel' &&
        levelNumericId !== undefined &&
        levelDraft && (
          <div
            className={
              activeTab === 'level'
                ? styles.railTabBody
                : styles.railTabBodyHidden
            }
          >
            <LevelMetadata
              key={active.id}
              experience={active}
              levelDraft={levelDraft}
            />
          </div>
        )}
    </div>
  );
}

function LevelMetadata({
  experience,
  levelDraft,
}: {
  experience: ExistingLevelExperience;
  levelDraft: UseLevelDraftResult;
}) {
  const {
    effectiveSolutionXml,
    effectiveIdeal,
    effectiveVerified,
    setIdeal,
    dirty,
    busy,
    error,
    checking,
    checkResult,
    dismissCheckResult,
    runCheck,
    submit,
    discard,
  } = levelDraft;

  return (
    <div className={styles.levelRail}>
      <Typography variant="h6" component="h2">
        Level
      </Typography>

      <TitleField experience={experience} />

      <div className={styles.solutionStatus}>
        <Typography variant="body4" component="span">
          {effectiveSolutionXml
            ? effectiveVerified
              ? `Solution: verified by author run (${effectiveIdeal ?? '?'} blocks)`
              : 'Solution: saved, not verified since the last change'
            : 'No verified solution'}
        </Typography>
        <label htmlFor="level-rail-ideal">
          Target block count
          <input
            id="level-rail-ideal"
            type="number"
            min={0}
            value={effectiveIdeal ?? ''}
            onChange={e => setIdeal(e.target.value)}
          />
        </label>
      </div>

      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      {checkResult && (
        <LevelCheckCard result={checkResult} onDismiss={dismissCheckResult} />
      )}
      <div className={styles.composerActions}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() => void runCheck()}
          disabled={checking}
        >
          {checking ? 'Checking…' : 'Check level'}
        </Button>
        {dirty && (
          <Button
            type="button"
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={discard}
          >
            Discard
          </Button>
        )}
        <Button
          type="button"
          variant="contained"
          size="small"
          disabled={busy || !dirty}
          onClick={() => void submit()}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/** Level title — editable via `updateLevel` (wired here for the first time;
 * previously only the agent tool called this op). */
function TitleField({experience}: {experience: ExistingLevelExperience}) {
  const [value, setValue] = useState(experience.title ?? '');
  const [busy, setBusy] = useState(false);
  const dirty = value !== (experience.title ?? '');

  const submit = async () => {
    if (busy || !dirty) {
      return;
    }
    setBusy(true);
    try {
      await authoringApi.applyChange({
        op: 'updateLevel',
        experienceId: experience.id,
        patch: {title: value},
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <label htmlFor="level-rail-title" className={styles.levelRailTitleField}>
      Title
      <input
        id="level-rail-title"
        type="text"
        value={value}
        disabled={busy}
        onChange={e => setValue(e.target.value)}
        onBlur={() => void submit()}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            void submit();
          }
        }}
      />
    </label>
  );
}
