import classNames from 'classnames';
import {type ReactNode, useLayoutEffect, useRef, useState} from 'react';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {thresholdText, type DisplayTreePathStep} from '../helpers/displayTree';
import {branchLabel} from '../helpers/displayTreeNodeContent';

import NodePathStep from './NodePathStep';

import styles from './nodePath.module.scss';

const pathSteps = (
  path: DisplayTreePathStep[],
  nodeLabel: string,
  datasetId: string,
): ReactNode[] =>
  path.map(({node}, index) => {
    if (node.type === 'answer') {
      return (
        <>
          AI predicts <strong>{nodeLabel}</strong>
        </>
      );
    }
    const column = getLocalizedColumnName(datasetId, node.column);
    const taken = path[index + 1]?.branch;
    if (!taken) {
      return `${column}?`;
    }
    const value =
      taken.kind === 'values'
        ? branchLabel(taken, datasetId).text
        : thresholdText(taken);
    return (
      <>
        {column} is <strong>{value}</strong>
      </>
    );
  });

interface NodePathProps {
  path: DisplayTreePathStep[];
  nodeLabel: string;
  datasetId: string;
}

// When the steps don't fit, the earliest collapse to just their numbers.
// The current step always keeps its text, truncated if it has to be.
const NodePath = ({path, nodeLabel, datasetId}: NodePathProps) => {
  const listRef = useRef<HTMLOListElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [collapsedCount, setCollapsedCount] = useState(0);
  const steps = pathSteps(path, nodeLabel, datasetId);
  const lastIndex = steps.length - 1;
  const nodeId = path[lastIndex].id;

  useLayoutEffect(() => {
    const list = listRef.current!;
    const measure = measureRef.current!;
    const fit = () => {
      // The hidden copy lists every step in full, then every step collapsed.
      const widths = [...measure.children].map(
        item => (item as HTMLElement).offsetWidth,
      );
      const full = widths.slice(0, widths.length / 2);
      const compact = widths.slice(widths.length / 2);
      const style = getComputedStyle(list);
      const gap = parseFloat(style.columnGap) || 0;
      const available =
        list.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const widthWith = (count: number) =>
        full.reduce(
          (sum, width, index) =>
            sum + (index < count ? compact[index] : width) + gap,
          -gap,
        );
      let count = 0;
      while (count < full.length - 1 && widthWith(count) > available) {
        count++;
      }
      setCollapsedCount(count);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(list);
    return () => observer.disconnect();
  }, [nodeId]);

  return (
    <>
      <ol ref={listRef} aria-label="Path to this node" className={styles.path}>
        {steps.map((step, index) => (
          <li
            key={path[index].id}
            aria-current={index === lastIndex ? 'step' : undefined}
            className={classNames(styles.step, {
              [styles.currentStep]: index === lastIndex,
            })}
          >
            <NodePathStep
              step={step}
              index={index}
              collapsed={index < collapsedCount}
            />
          </li>
        ))}
      </ol>
      <ol
        ref={measureRef}
        aria-hidden="true"
        className={classNames(styles.path, styles.measure)}
      >
        {[false, true].map(collapsed =>
          steps.map((step, index) => (
            <li key={`${collapsed}-${path[index].id}`} className={styles.step}>
              <NodePathStep step={step} index={index} collapsed={collapsed} />
            </li>
          )),
        )}
      </ol>
    </>
  );
};

export default NodePath;
