import {Button, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';

import type {Experience, ExistingLevelExperience} from '@code-dot-org/authoring';
import {
  getPaintTools,
  getToolboxPalette,
  toolboxXmlFromTray,
  trayFromToolboxXml,
  type ToolboxTrayEntry,
} from '@code-dot-org/maze-lab';

import {authoringApi, useLevelProperties} from '@/modules/authoring';
import type {LevelCheckResponse} from '@/modules/authoring';

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
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  mapDraftPatch?: {serialized_maze: string; maze: string};
  onToolboxDraftChange: (xml: string) => void;
  startBlocksEditingActive: boolean;
  onToggleStartBlocksEditing: (active: boolean) => void;
  startBlocksDraftXml?: string;
  onDirtyChange: (dirty: boolean) => void;
  /** Discards every in-progress edit (draft, tray, paint tool, start-blocks
   * capture) without saving — the rail's equivalent of the former right
   * panel's Cancel, now that there is no panel to close. */
  onDiscard: () => void;
}

/**
 * Left rail — "Outline" and "Level" sibling tabs (Contentful's own
 * Components/Layers/Settings sibling-tab model, per the CMS-IA research at
 * docs/prototypes/author-mode-cms-ux-research.md). Final layout after two
 * earlier iterations this same pass: a right-panel "Level" click-target
 * (rejected — level-wide settings are page settings, not a stage
 * click-target), then replacing the outline outright whenever a maze level
 * is active (rejected — the research's #3 gap: it lost outline navigation
 * and the type chips while a level's settings were showing). Sibling tabs
 * keep both: Outline stays the default, the Level tab lights up only for a
 * maze-family experience, and BOTH stay mounted (only one visible) so
 * switching tabs never discards an in-progress edit — Save/Discard inside
 * the Level tab are still the only way to resolve one, same as before.
 */
export default function LevelRail({
  lessonId,
  experiences,
  activeIndex,
  onSelect,
  onAskAiAt,
  active,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
  onToolboxDraftChange,
  startBlocksEditingActive,
  onToggleStartBlocksEditing,
  startBlocksDraftXml,
  onDirtyChange,
  onDiscard,
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
        levelNumericId !== undefined && (
          <div
            className={
              activeTab === 'level'
                ? styles.railTabBody
                : styles.railTabBodyHidden
            }
          >
            <LevelSettings
              key={active.id}
              experience={active}
              levelNumericId={levelNumericId}
              skin={levelProps?.skin as string | undefined}
              startDirection={levelProps?.startDirection as string | undefined}
              toolboxBlocksXml={
                levelProps?.toolboxBlocksXml as string | undefined
              }
              onDirtyChange={onDirtyChange}
              selectedPaintToolId={selectedPaintToolId}
              onSelectPaintTool={onSelectPaintTool}
              mapDraftPatch={mapDraftPatch}
              onToolboxDraftChange={onToolboxDraftChange}
              startBlocksEditingActive={startBlocksEditingActive}
              onToggleStartBlocksEditing={onToggleStartBlocksEditing}
              startBlocksDraftXml={startBlocksDraftXml}
              onDiscard={onDiscard}
            />
          </div>
        )}
    </div>
  );
}

// Mirrors PropertiesPanel.tsx's START_DIRECTION_OPTIONS/tiles.ts's Direction
// enum comment verbatim — kept as its own copy for the reason given there.
const START_DIRECTION_OPTIONS = [
  {value: '0', label: 'North'},
  {value: '1', label: 'East'},
  {value: '2', label: 'South'},
  {value: '3', label: 'West'},
] as const;

/** Accumulated edits for the level rail — startDirection and the map fields
 * (both carried over from the right panel's former 'level' section), plus
 * the toolbox tray and student-start XML this pass adds. Every key
 * optional: Save only ever sends what the author actually touched. */
interface LevelDraftPatch {
  startDirection?: string;
  serialized_maze?: string;
  maze?: string;
  toolboxBlocksXml?: string;
  startBlocksXml?: string;
}

function LevelSettings({
  experience,
  levelNumericId,
  skin,
  startDirection,
  toolboxBlocksXml,
  onDirtyChange,
  selectedPaintToolId,
  onSelectPaintTool,
  mapDraftPatch,
  onToolboxDraftChange,
  startBlocksEditingActive,
  onToggleStartBlocksEditing,
  startBlocksDraftXml,
  onDiscard,
}: {
  experience: ExistingLevelExperience;
  levelNumericId: number;
  skin?: string;
  startDirection?: string;
  toolboxBlocksXml?: string;
  onDirtyChange: (dirty: boolean) => void;
  selectedPaintToolId?: string;
  onSelectPaintTool: (id: string | undefined) => void;
  mapDraftPatch?: {serialized_maze: string; maze: string};
  onToolboxDraftChange: (xml: string) => void;
  startBlocksEditingActive: boolean;
  onToggleStartBlocksEditing: (active: boolean) => void;
  startBlocksDraftXml?: string;
  onDiscard: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<LevelDraftPatch>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<LevelCheckResponse | null>(
    null,
  );
  const [checking, setChecking] = useState(false);
  const [tray, setTray] = useState<ToolboxTrayEntry[]>(() =>
    trayFromToolboxXml(toolboxBlocksXml ?? '<xml></xml>', skin ?? 'birds'),
  );
  const currentValue = draft.startDirection ?? startDirection ?? '1';
  const dirty = Object.keys(draft).length > 0;
  const paintTools = skin ? getPaintTools(skin) : [];
  const palette = skin ? getToolboxPalette(skin) : [];
  const trayIds = new Set(tray.map(t => t.id));
  const availableBlocks = palette.filter(entry => !trayIds.has(entry.id));

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  // Every stage paint reports a fresh {serialized_maze, maze} patch here —
  // fold it into the Save draft the same way a startDirection edit does.
  useEffect(() => {
    if (mapDraftPatch) {
      setDraft(prev => ({...prev, ...mapDraftPatch}));
    }
  }, [mapDraftPatch]);

  // Every workspace mutation while Student-start editing is on reports a
  // fresh capture here — same fold-into-draft shape as map painting.
  useEffect(() => {
    if (startBlocksDraftXml !== undefined) {
      setDraft(prev => ({...prev, startBlocksXml: startBlocksDraftXml}));
    }
  }, [startBlocksDraftXml]);

  const addChip = (entry: ToolboxTrayEntry) => {
    const nextTray = [...tray, entry];
    setTray(nextTray);
    const xml = toolboxXmlFromTray(nextTray);
    onToolboxDraftChange(xml);
    setDraft(prev => ({...prev, toolboxBlocksXml: xml}));
  };

  const removeChip = (id: string) => {
    const nextTray = tray.filter(t => t.id !== id);
    setTray(nextTray);
    const xml = toolboxXmlFromTray(nextTray);
    onToolboxDraftChange(xml);
    setDraft(prev => ({...prev, toolboxBlocksXml: xml}));
  };

  const submit = async () => {
    if (busy || !dirty) {
      return;
    }
    setBusy(true);
    setError(null);
    setCheckResult(null);
    try {
      await authoringApi.applyChange({
        op: 'overrideLevelDefinition',
        experienceId: experience.id,
        patch: draft,
      });
      await queryClient.invalidateQueries({
        queryKey: ['authoring', 'levelProperties', levelNumericId],
      });
      setDraft({});
      // A painted map, toolbox, or start arrangement that breaks solvability
      // should tell the author immediately, not silently — but a failed
      // check is still a successful Save (§1.10: Save is never gated on
      // verification), so this runs after the invalidate/reset above
      // regardless of outcome.
      try {
        setCheckResult(await authoringApi.checkLevel(levelNumericId));
      } catch (checkError) {
        setCheckResult({
          ok: false,
          mode: 'palette',
          reasons: [
            checkError instanceof Error
              ? checkError.message
              : 'check failed',
          ],
        });
      }
    } catch {
      setError('That change failed to apply.');
    } finally {
      setBusy(false);
    }
  };

  const runCheck = async () => {
    setChecking(true);
    try {
      setCheckResult(await authoringApi.checkLevel(levelNumericId));
    } catch (checkError) {
      setCheckResult({
        ok: false,
        mode: 'palette',
        reasons: [
          checkError instanceof Error ? checkError.message : 'check failed',
        ],
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <form
      className={styles.levelRail}
      aria-label="Level settings"
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <Typography variant="h6" component="h2">
        Level
      </Typography>

      <label htmlFor="level-rail-start-direction">Start direction</label>
      <select
        id="level-rail-start-direction"
        value={currentValue}
        onChange={e =>
          setDraft(prev => ({...prev, startDirection: e.target.value}))
        }
      >
        {START_DIRECTION_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {paintTools.length > 0 && (
        <div className={styles.paintPalette}>
          <Typography variant="body4" component="span">
            Paint the map — click a tile below, then a cell on the stage.
          </Typography>
          <div className={styles.paintPaletteTools}>
            {paintTools.map(tool => (
              <Button
                key={tool.id}
                type="button"
                size="small"
                variant={
                  selectedPaintToolId === tool.id ? 'contained' : 'outlined'
                }
                aria-pressed={selectedPaintToolId === tool.id}
                onClick={() =>
                  onSelectPaintTool(
                    selectedPaintToolId === tool.id ? undefined : tool.id,
                  )
                }
              >
                {tool.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.toolboxTray}>
        <Typography variant="body4" component="span">
          Student toolbox
        </Typography>
        <div className={styles.toolboxTrayColumns}>
          <div className={styles.toolboxTrayColumn}>
            <Typography variant="body4" component="span">
              Available blocks
            </Typography>
            <ul className={styles.toolboxChipList}>
              {availableBlocks.map(entry => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={styles.toolboxChip}
                    onClick={() => addChip({...entry})}
                    aria-label={`Add ${entry.label} to the student toolbox`}
                  >
                    + {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.toolboxTrayColumn}>
            <Typography variant="body4" component="span">
              In the toolbox
            </Typography>
            <ul className={styles.toolboxChipList}>
              {tray.map(entry => (
                <li key={entry.id}>
                  <span className={styles.toolboxChip}>
                    {entry.label}
                    <button
                      type="button"
                      aria-label={`Remove ${entry.label} from the student toolbox`}
                      onClick={() => removeChip(entry.id)}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.paintPalette}>
        <Button
          type="button"
          size="small"
          variant={startBlocksEditingActive ? 'contained' : 'outlined'}
          aria-pressed={startBlocksEditingActive}
          onClick={() => onToggleStartBlocksEditing(!startBlocksEditingActive)}
        >
          {startBlocksEditingActive
            ? 'Editing student start blocks — arrange on the stage'
            : 'Edit student start blocks'}
        </Button>
      </div>

      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      {checkResult && (
        <LevelCheckCard
          result={checkResult}
          onDismiss={() => setCheckResult(null)}
        />
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
            onClick={() => {
              setDraft({});
              setTray(
                trayFromToolboxXml(
                  toolboxBlocksXml ?? '<xml></xml>',
                  skin ?? 'birds',
                ),
              );
              onDiscard();
            }}
          >
            Discard
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={busy || !dirty}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
