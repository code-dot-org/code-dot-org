import {Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import {type ReactNode, useLayoutEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {getLocalizedColumnName} from '../helpers/columnDetails';
import {type DisplayTreePathStep} from '../helpers/displayTree';
import {branchLabel} from '../helpers/displayTreeNodeContent';

import styles from './nodePath.module.scss';

interface Step {
  content: ReactNode;
  text: string;
}

const pathSteps = (
  path: DisplayTreePathStep[],
  nodeLabel: string,
  datasetId: string,
): Step[] =>
  path.map(({node}, index) => {
    if (node.type === 'answer') {
      return {
        content: (
          <>
            AI predicts <strong>{nodeLabel}</strong>
          </>
        ),
        text: `AI predicts ${nodeLabel}`,
      };
    }
    const column = getLocalizedColumnName(datasetId, node.column);
    const taken = path[index + 1]?.branch;
    if (!taken) {
      return {content: `${column}?`, text: `${column}?`};
    }
    const {sign, text} = branchLabel(taken, datasetId);
    const value = sign ? `${sign} ${text}` : text;
    return {
      content: (
        <>
          {column} is <strong>{value}</strong>
        </>
      ),
      text: `${column} is ${value}`,
    };
  });

interface StepContentProps {
  step: Step;
  index: number;
  collapsed: boolean;
  measuring?: boolean;
}

const StepContent = ({
  step,
  index,
  collapsed,
  measuring = false,
}: StepContentProps) => (
  <>
    {index > 0 && (
      <FontAwesomeV6Icon
        iconName="caret-right"
        iconStyle="solid"
        className={styles.caret}
        aria-hidden="true"
      />
    )}
    {collapsed && measuring ? (
      <span className={styles.stepNumber}>{index + 1}</span>
    ) : collapsed ? (
      <Tooltip title={step.content} placement="bottom">
        <button
          type="button"
          className={classNames(styles.stepNumber, styles.stepNumberButton)}
          aria-label={`${index + 1}. ${step.text}`}
        >
          {index + 1}
        </button>
      </Tooltip>
    ) : (
      <span className={styles.stepBody}>
        <span className={styles.stepNumber}>{index + 1}</span>
        <Typography
          variant="body3"
          component="span"
          className={styles.stepText}
        >
          {step.content}
        </Typography>
      </span>
    )}
  </>
);

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
  const signature = steps.map(step => step.text).join('\n');

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
  }, [signature]);

  const lastIndex = steps.length - 1;

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
            <StepContent
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
              <StepContent
                step={step}
                index={index}
                collapsed={collapsed}
                measuring
              />
            </li>
          )),
        )}
      </ol>
    </>
  );
};

export default NodePath;
