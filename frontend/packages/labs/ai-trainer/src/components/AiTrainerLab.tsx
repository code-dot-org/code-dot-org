import {useCallback, useEffect, useRef, useState} from 'react';

import type {Blockly} from '@code-dot-org/blockly-workspace';
import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import {getAllGeneratedCode} from '@code-dot-org/blockly-workspace/utils';
import {useLevelProperties} from '@code-dot-org/lab/contexts';

import blocks from '../blocks';
import {runOn, type RunResult} from '../classifiers';
import {ALGORITHM_LABELS, TEST_SET, TRAINING_SET} from '../dataset';
import type {AlgorithmId, Creature, Label} from '../dataset';
import type {AiTrainerLevelProperties} from '../types';
import ClassifierVisualizer from './ClassifierVisualizer';

import styles from './aiTrainerLab.module.scss';

// Pre-populated workspace: `when_run → predict using nearest neighbor`.
const DEFAULT_START_BLOCKS = {
  blocks: {
    blocks: [
      {
        type: 'when_run',
        next: {
          block: {
            type: 'aitrainer_predict',
            fields: {ALGO: 'nearest-neighbor'},
          },
        },
      },
    ],
  },
};

const DEFAULT_TOOLBOX = {
  kind: 'flyoutToolbox' as const,
  contents: [
    {kind: 'block', type: 'aitrainer_predict'},
    {kind: 'block', type: 'aitrainer_compare'},
    {kind: 'block', type: 'aitrainer_clear'},
  ],
};

const FRAME_MS = 750;

interface ResultLine {
  algorithm: AlgorithmId;
  correct: number;
  total: number;
}

/**
 * One step of the algorithm-visualization animation. Each frame carries
 * (a) what to highlight (test row, training row), (b) a caption describing
 * what's happening, (c) any per-algorithm side info (training tally, rule
 * text), and (d) the cumulative set of test predictions revealed so far.
 *
 * Generated up-front by `generateFrames`, then played back with setTimeout.
 */
interface AnimFrame {
  caption: string;
  highlightTestId?: number;
  highlightTrainingId?: number;
  trainingTally?: {friends: number; foes: number};
  ruleText?: string;
  revealedTestIds: number[];
}

const AiTrainerLab = () => {
  const levelProperties = useLevelProperties<AiTrainerLevelProperties>();
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [results, setResults] = useState<ResultLine[]>([]);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [frames, setFrames] = useState<AnimFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);

  const handleRun = useCallback(() => {
    if (!workspaceRef.current) return;
    const code = getAllGeneratedCode({
      startBlock: 'when_run',
      language: 'simple',
      workspaces: [workspaceRef.current],
    });
    interpret(code, setResults, run => {
      setLastRun(run);
      setFrames(run ? generateFrames(run) : []);
      setFrameIdx(0);
    });
  }, []);

  const handleReplay = useCallback(() => {
    if (lastRun) setFrameIdx(0);
  }, [lastRun]);

  // Tick the animation forward one frame at a time. Stops at the last frame
  // (the final state — everything revealed).
  useEffect(() => {
    if (frames.length === 0 || frameIdx >= frames.length - 1) return;
    const t = window.setTimeout(() => setFrameIdx(i => i + 1), FRAME_MS);
    return () => window.clearTimeout(t);
  }, [frames, frameIdx]);

  const currentFrame: AnimFrame | null =
    frames.length > 0 ? frames[Math.min(frameIdx, frames.length - 1)] : null;
  const revealedSet = currentFrame
    ? new Set(currentFrame.revealedTestIds)
    : null;
  const isAnimating = frames.length > 0 && frameIdx < frames.length - 1;

  return (
    <div className={styles.lab}>
      <section className={styles.dataPanel} aria-label="Dataset">
        <header className={styles.panelHeader}>
          <h3>Training data</h3>
          <span className={styles.muted}>labels shown</span>
        </header>
        <CreatureGrid
          rows={TRAINING_SET}
          predictions={null}
          revealLabels
          highlightId={currentFrame?.highlightTrainingId}
        />

        <header className={styles.panelHeader}>
          <h3>Test data</h3>
          <span className={styles.muted}>
            {lastRun
              ? `${lastRun.correctCount} / ${lastRun.totalCount} correct`
              : 'click Run to classify'}
          </span>
        </header>
        <CreatureGrid
          rows={TEST_SET}
          predictions={
            lastRun ? perCreaturePredictions(lastRun, revealedSet) : null
          }
          revealLabels={revealedSet === null ? false : true}
          revealOnly={revealedSet}
          highlightId={currentFrame?.highlightTestId}
        />

        {currentFrame && lastRun && (
          <>
            <header className={styles.panelHeader}>
              <h3>{isAnimating ? 'Animating…' : 'How it works'}</h3>
              <div className={styles.frameControls}>
                <span className={styles.muted}>
                  {Math.min(frameIdx + 1, frames.length)} / {frames.length}
                </span>
                <button
                  type="button"
                  className={styles.replayButton}
                  onClick={handleReplay}
                  disabled={isAnimating}
                  aria-label="Replay animation"
                >
                  ↻ Replay
                </button>
              </div>
            </header>
            <ClassifierVisualizer
              algorithm={lastRun.algorithm}
              predictions={perCreaturePredictions(lastRun, revealedSet)}
              highlight={{
                testId: currentFrame.highlightTestId,
                trainingId: currentFrame.highlightTrainingId,
              }}
              revealed={
                revealedSet ?? new Set(lastRun.predictions.map(p => p.creature.id))
              }
              majorityWinner={majorityWinner(lastRun)}
            />
            <AnimationPanel frame={currentFrame} />
          </>
        )}

        <header className={styles.panelHeader}>
          <h3>Results</h3>
        </header>
        <ul className={styles.resultList}>
          {results.length === 0 ? (
            <li className={styles.placeholder}>
              Snap a `predict` block under `when run`, then press Run.
            </li>
          ) : (
            results.map((r, i) => (
              <li key={i}>
                <span className={styles.resultLabel}>
                  {ALGORITHM_LABELS[r.algorithm]}
                </span>
                <span className={styles.resultValue}>
                  {r.correct} / {r.total} ({percent(r.correct, r.total)})
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className={styles.workspacePanel} aria-label="Workspace">
        <header className={styles.panelHeader}>
          <h3>Blocks</h3>
          <button
            type="button"
            className={styles.runButton}
            onClick={handleRun}
          >
            ▶ Run
          </button>
        </header>
        <div className={styles.workspaceHost}>
          <BlocklyWorkspace
            className={styles.blocklyWorkspace}
            blocks={blocks}
            startBlocks={levelProperties?.startBlocks || DEFAULT_START_BLOCKS}
            toolbox={levelProperties?.toolboxBlocks || DEFAULT_TOOLBOX}
            workspaceRef={workspaceRef}
            options={{trashcan: false}}
          />
        </div>
      </section>
    </div>
  );
};

/**
 * The panel that replaces the old static "How it works." Each frame renders
 * a one-line caption plus any per-algorithm side widget (label-count bars
 * for majority, a rule block for the rule-based algorithms).
 */
function AnimationPanel({frame}: {frame: AnimFrame}) {
  return (
    <div className={styles.explanation}>
      <p className={styles.caption}>{frame.caption}</p>
      {frame.trainingTally && (
        <div className={styles.bars}>
          <Bar
            label="friend"
            count={frame.trainingTally.friends}
            total={
              frame.trainingTally.friends + frame.trainingTally.foes
            }
            color="#22c55e"
          />
          <Bar
            label="foe"
            count={frame.trainingTally.foes}
            total={
              frame.trainingTally.friends + frame.trainingTally.foes
            }
            color="#ef4444"
          />
        </div>
      )}
      {frame.ruleText && (
        <pre className={styles.ruleBlock}>{frame.ruleText}</pre>
      )}
    </div>
  );
}

/**
 * Build the per-algorithm animation script. Order matters — frame N's
 * `revealedTestIds` includes all tests revealed by frames 0..N. The lab UI
 * uses that to decide whether to draw each test row's prediction badge.
 */
function generateFrames(run: RunResult): AnimFrame[] {
  switch (run.algorithm) {
    case 'majority': {
      // Build up the tally one training row at a time, then sweep through
      // the test set applying the winning label.
      const frames: AnimFrame[] = [];
      let friends = 0;
      let foes = 0;
      frames.push({
        caption:
          'Majority class: count labels in training, predict the winner for everything.',
        revealedTestIds: [],
        trainingTally: {friends, foes},
      });
      for (const t of TRAINING_SET) {
        if (t.label === 'friend') friends++;
        else foes++;
        frames.push({
          caption: `Training #${t.id} is "${t.label}" — running tally ${friends}/${foes}.`,
          highlightTrainingId: t.id,
          trainingTally: {friends, foes},
          revealedTestIds: [],
        });
      }
      const winner: Label = friends >= foes ? 'friend' : 'foe';
      frames.push({
        caption: `Winner is "${winner}". Predicting "${winner}" for every test row.`,
        trainingTally: {friends, foes},
        revealedTestIds: [],
      });
      const revealed: number[] = [];
      for (const p of run.predictions) {
        revealed.push(p.creature.id);
        frames.push({
          caption: `Test #${p.creature.id} → "${winner}".`,
          highlightTestId: p.creature.id,
          trainingTally: {friends, foes},
          revealedTestIds: [...revealed],
        });
      }
      return frames;
    }

    case 'nearest-neighbor': {
      const frames: AnimFrame[] = [
        {
          caption:
            'Nearest neighbor: for each test row, find the closest training row and copy its label.',
          revealedTestIds: [],
        },
      ];
      const revealed: number[] = [];
      for (const p of run.predictions) {
        if (p.explanation.kind !== 'nearest-neighbor') continue;
        revealed.push(p.creature.id);
        frames.push({
          caption: `Test #${p.creature.id} (${p.creature.eyes} eyes, ${p.creature.size}) → nearest is training #${p.explanation.neighborId} (distance ${p.explanation.distance}) → predict "${p.predicted}".`,
          highlightTestId: p.creature.id,
          highlightTrainingId: p.explanation.neighborId,
          revealedTestIds: [...revealed],
        });
      }
      return frames;
    }

    case 'eyes-rule':
    case 'size-rule': {
      const feature: 'eyes' | 'size' =
        run.algorithm === 'eyes-rule' ? 'eyes' : 'size';
      const ruleText =
        feature === 'eyes'
          ? 'if eyes == 3 → foe;  else → friend'
          : 'if size == "large" → foe;  else → friend';
      const frames: AnimFrame[] = [
        {
          caption:
            'A hand-written rule. Looks at one feature on each test row and decides — no training data needed.',
          ruleText,
          revealedTestIds: [],
        },
      ];
      const revealed: number[] = [];
      for (const p of run.predictions) {
        revealed.push(p.creature.id);
        frames.push({
          caption: `Test #${p.creature.id}: ${feature} = ${p.creature[feature]} → predict "${p.predicted}".`,
          highlightTestId: p.creature.id,
          ruleText,
          revealedTestIds: [...revealed],
        });
      }
      return frames;
    }
  }
}

/**
 * For the majority classifier, extract the winning label so the visualizer
 * can tint the canvas. Other algorithms return null.
 */
function majorityWinner(run: RunResult): Label | null {
  if (run.algorithm !== 'majority') return null;
  // All predictions are the same for majority — pick the first.
  return run.predictions[0]?.predicted ?? null;
}

function perCreaturePredictions(
  run: RunResult,
  revealedOnly: Set<number> | null,
): Map<number, {predicted: Label; correct: boolean}> {
  const m = new Map<number, {predicted: Label; correct: boolean}>();
  for (const p of run.predictions) {
    if (revealedOnly && !revealedOnly.has(p.creature.id)) continue;
    m.set(p.creature.id, {predicted: p.predicted, correct: p.correct});
  }
  return m;
}

function percent(num: number, den: number): string {
  if (den === 0) return '—';
  return `${Math.round((100 * num) / den)}%`;
}

function CreatureGlyph({
  creature,
  revealLabel,
  predicted,
  correct,
  highlighted,
}: {
  creature: Creature;
  revealLabel: boolean;
  predicted?: Label;
  correct?: boolean;
  highlighted?: boolean;
}) {
  const baseColor = revealLabel
    ? creature.label === 'friend'
      ? '#22c55e'
      : '#ef4444'
    : '#94a3b8';
  const sizePx = creature.size === 'small' ? 36 : 48;
  const wrapClass = [styles.creature];
  if (highlighted) wrapClass.push(styles.creatureHighlighted);
  return (
    <div className={wrapClass.join(' ')}>
      <div
        className={styles.creatureFace}
        style={{width: sizePx, height: sizePx, background: baseColor}}
        aria-label={`${creature.eyes} eyes, ${creature.size}`}
      >
        {Array.from({length: creature.eyes}).map((_, i) => (
          <span key={i} className={styles.eye} />
        ))}
      </div>
      <div className={styles.creatureMeta}>
        <span className={styles.creatureLabel}>
          {revealLabel ? creature.label : '?'}
        </span>
        {predicted !== undefined && (
          <span
            className={
              correct ? styles.predictionCorrect : styles.predictionWrong
            }
          >
            {predicted}
          </span>
        )}
      </div>
    </div>
  );
}

function CreatureGrid({
  rows,
  predictions,
  revealLabels,
  revealOnly,
  highlightId,
}: {
  rows: Creature[];
  predictions: Map<number, {predicted: Label; correct: boolean}> | null;
  revealLabels: boolean;
  revealOnly?: Set<number> | null;
  highlightId?: number;
}) {
  return (
    <div className={styles.creatureGrid}>
      {rows.map(row => {
        const pred = predictions?.get(row.id);
        // For the test grid, only reveal label/prediction for rows that the
        // current animation frame has reached.
        const revealThis =
          revealLabels &&
          (revealOnly === undefined ||
            revealOnly === null ||
            revealOnly.has(row.id));
        return (
          <CreatureGlyph
            key={row.id}
            creature={row}
            revealLabel={revealThis}
            predicted={pred?.predicted}
            correct={pred?.correct}
            highlighted={highlightId === row.id}
          />
        );
      })}
    </div>
  );
}

function Bar({label, count, total, color}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : (100 * count) / total;
  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{width: `${pct}%`, background: color}}
        />
      </div>
      <span className={styles.barCount}>{count}</span>
    </div>
  );
}

/**
 * Tiny interpreter for the simple-flavored code our blocks emit:
 *   predict('algo');
 *   compare('algo-a', 'algo-b');
 *   clear();
 */
function interpret(
  code: string,
  setResults: (r: ResultLine[] | ((prev: ResultLine[]) => ResultLine[])) => void,
  setLastRun: (r: RunResult | null) => void,
) {
  let lastRun: RunResult | null = null;
  const newLines: ResultLine[] = [];

  const knownAlgos: AlgorithmId[] = [
    'majority',
    'nearest-neighbor',
    'eyes-rule',
    'size-rule',
  ];

  for (const rawLine of code.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^clear\(\);?$/))) {
      setResults([]);
      setLastRun(null);
      newLines.length = 0;
      lastRun = null;
    } else if ((m = line.match(/^predict\(\s*'([^']+)'\s*\);?$/))) {
      const algo = m[1] as AlgorithmId;
      if (!knownAlgos.includes(algo)) continue;
      const run = runOn(algo, TEST_SET);
      lastRun = run;
      newLines.push({
        algorithm: algo,
        correct: run.correctCount,
        total: run.totalCount,
      });
    } else if (
      (m = line.match(/^compare\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\);?$/))
    ) {
      const a = m[1] as AlgorithmId;
      const b = m[2] as AlgorithmId;
      if (!knownAlgos.includes(a) || !knownAlgos.includes(b)) continue;
      const runA = runOn(a, TEST_SET);
      const runB = runOn(b, TEST_SET);
      newLines.push(
        {algorithm: a, correct: runA.correctCount, total: runA.totalCount},
        {algorithm: b, correct: runB.correctCount, total: runB.totalCount},
      );
      lastRun = runA.correctCount >= runB.correctCount ? runA : runB;
    }
  }

  if (newLines.length > 0) {
    setResults(prev => [...prev, ...newLines]);
  }
  setLastRun(lastRun);
}

export default AiTrainerLab;
