import type {Blockly} from '@code-dot-org/blockly-workspace';
import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import {getAllGeneratedCode} from '@code-dot-org/blockly-workspace/utils';
import {useLevelProperties} from '@code-dot-org/lab/contexts';
import {useCallback, useMemo, useRef, useState} from 'react';

import blocks from '../blocks';
import {SAMPLE_DATASET} from '../dataset';
import type {DatasciLevelProperties, DatasciResult, DatasciRow} from '../types';

import styles from './datasciLab.module.scss';

/**
 * Default workspace contents — just the `when_run` head block. The lesson
 * passes its own startBlocks via level_properties; this is the fallback when
 * none is provided.
 */
const DEFAULT_START_BLOCKS = {
  blocks: {
    blocks: [{type: 'when_run'}],
  },
};

/**
 * Default toolbox — every datasci block available. The lesson can override
 * this via level_properties to restrict the toolbox per step.
 */
const DEFAULT_TOOLBOX = {
  kind: 'flyoutToolbox' as const,
  contents: [
    {kind: 'block', type: 'datasci_count'},
    {kind: 'block', type: 'datasci_average'},
    {kind: 'block', type: 'datasci_filter_grade'},
    {kind: 'block', type: 'datasci_reset'},
  ],
};

const DatasciLab = () => {
  const levelProperties = useLevelProperties<DatasciLevelProperties>();
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [results, setResults] = useState<DatasciResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<3 | 4 | 5 | null>(null);

  const filteredRows = useMemo<DatasciRow[]>(() => {
    if (activeFilter === null) return SAMPLE_DATASET;
    return SAMPLE_DATASET.filter(r => r.grade === activeFilter);
  }, [activeFilter]);

  const handleRun = useCallback(() => {
    if (!workspaceRef.current) return;
    const code = getAllGeneratedCode({
      startBlock: 'when_run',
      language: 'simple',
      workspaces: [workspaceRef.current],
    });
    interpret(code, setResults, setActiveFilter);
  }, []);

  const handleReset = useCallback(() => {
    setResults([]);
    setActiveFilter(null);
  }, []);

  return (
    <div className={styles.lab}>
      <section className={styles.dataPanel} aria-label="Dataset">
        <header className={styles.panelHeader}>
          <h3>Dataset</h3>
          <span className={styles.filterBadge}>
            {activeFilter === null
              ? 'all rows'
              : `grade ${activeFilter} only (${filteredRows.length} rows)`}
          </span>
        </header>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>grade</th>
              <th>score</th>
              <th>hobby</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_DATASET.map(row => {
              const visible =
                activeFilter === null || row.grade === activeFilter;
              return (
                <tr
                  key={row.id}
                  className={visible ? '' : styles.dimmed}
                >
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.grade}</td>
                  <td>{row.score}</td>
                  <td>{row.hobby}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <header className={styles.panelHeader}>
          <h3>Results</h3>
        </header>
        <ul className={styles.resultList}>
          {results.length === 0 ? (
            <li className={styles.placeholder}>
              Press Run to evaluate your blocks.
            </li>
          ) : (
            results.map((r, i) => (
              <li key={i}>
                <span className={styles.resultLabel}>{r.label}</span>
                <span className={styles.resultValue}>{r.value}</span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className={styles.workspacePanel} aria-label="Workspace">
        <header className={styles.panelHeader}>
          <h3>Blocks</h3>
          <div className={styles.workspaceButtons}>
            <button
              type="button"
              className={styles.runButton}
              onClick={handleRun}
            >
              ▶ Run
            </button>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
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
 * Tiny interpreter for the simple-flavored code produced by our blocks.
 * Each statement is one of:
 *   count();
 *   average('score');
 *   filterGrade(3);
 *   reset();
 *
 * Anything else is ignored. State (filter) lives in React via setActiveFilter.
 */
function interpret(
  code: string,
  setResults: (rs: DatasciResult[]) => void,
  setActiveFilter: (g: 3 | 4 | 5 | null) => void,
) {
  let filter: 3 | 4 | 5 | null = null;
  const out: DatasciResult[] = [];

  const rowsFor = () =>
    filter === null
      ? SAMPLE_DATASET
      : SAMPLE_DATASET.filter(r => r.grade === filter);

  for (const rawLine of code.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^count\(\);?$/))) {
      out.push({label: 'count', value: String(rowsFor().length)});
    } else if (
      (m = line.match(/^average\(\s*'(score|grade)'\s*\);?$/))
    ) {
      const col = m[1] as 'score' | 'grade';
      const rows = rowsFor();
      if (rows.length === 0) {
        out.push({label: `average(${col})`, value: '—'});
      } else {
        const avg =
          rows.reduce((s, r) => s + (col === 'score' ? r.score : r.grade), 0) /
          rows.length;
        out.push({
          label: `average(${col})`,
          value: avg.toFixed(1),
        });
      }
    } else if ((m = line.match(/^filterGrade\(\s*(3|4|5)\s*\);?$/))) {
      filter = Number(m[1]) as 3 | 4 | 5;
      out.push({
        label: 'filterGrade',
        value: `grade=${filter} → ${rowsFor().length} rows`,
      });
    } else if (line.match(/^reset\(\);?$/)) {
      filter = null;
      out.push({label: 'reset', value: `${SAMPLE_DATASET.length} rows`});
    }
  }

  setActiveFilter(filter);
  setResults(out);
}

export default DatasciLab;
