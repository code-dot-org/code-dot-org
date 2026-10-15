/* One dataset row at a time, as the top card of a deck. */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, iconButtonClasses, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
} from 'react';

import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {DataRow} from '../types';

import appStyles from '../app.module.scss';
import styles from './datasetRowCards.module.scss';

const DECK_PEEK = 2;

interface DatasetRowCardsProps {
  // Index into state.data.
  rowIndex: number;
  onRowIndexChange: (rowIndex: number) => void;
}

const DatasetRowCards = ({
  rowIndex,
  onRowIndexChange,
}: DatasetRowCardsProps) => {
  const data = useAppSelector(state => state.data);
  const total = data.length;
  // The card that just left, the front card, the ones peeking, and one waiting to fade in.
  const windowStart = Math.max(0, rowIndex - 1);
  const windowEnd = Math.min(total, rowIndex + DECK_PEEK + 2);

  const go = (index: number) =>
    onRowIndexChange(Math.min(Math.max(index, 0), total - 1));

  const onKeyDown = (event: KeyboardEvent) => {
    const target = {
      ArrowRight: rowIndex + 1,
      ArrowDown: rowIndex + 1,
      ArrowLeft: rowIndex - 1,
      ArrowUp: rowIndex - 1,
      Home: 0,
      End: total - 1,
    }[event.key];
    if (target !== undefined) {
      event.preventDefault();
      go(target);
    }
  };

  return (
    <div
      className={styles.root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Dataset rows"
    >
      <div className={styles.stage}>
        <div className={styles.deck}>
          {data.slice(windowStart, windowEnd).map((row, offset) => {
            const datasetRow = windowStart + offset;
            const depth = datasetRow - rowIndex;
            return (
              <div
                key={datasetRow}
                className={classNames(styles.slot, {
                  [styles.dealt]: depth < 0,
                  [styles.waiting]: depth > DECK_PEEK,
                })}
                style={{'--deck-depth': Math.max(0, depth)} as CSSProperties}
                aria-hidden={depth === 0 ? undefined : true}
              >
                {depth > 0 ? (
                  <div className={styles.ghost} />
                ) : (
                  <RowCard
                    front={depth === 0}
                    rowNumber={datasetRow + 1}
                    row={row}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <nav className={styles.pager} aria-label="Card navigation">
        <PagerButton
          label="Previous row"
          icon="chevron-left"
          disabled={rowIndex === 0}
          onClick={() => go(rowIndex - 1)}
          onKeyDown={onKeyDown}
        />
        <Typography
          component="span"
          variant="body3"
          className={styles.counter}
          aria-live="polite"
        >
          {`Row ${rowIndex + 1} of ${total}`}
        </Typography>
        <PagerButton
          label="Next row"
          icon="chevron-right"
          disabled={rowIndex === total - 1}
          onClick={() => go(rowIndex + 1)}
          onKeyDown={onKeyDown}
        />
      </nav>
    </div>
  );
};

// aria-disabled rather than disabled, so focus stays on the button at either end.
const PagerButton = ({
  label,
  icon,
  disabled,
  onClick,
  onKeyDown,
}: {
  label: string;
  icon: string;
  disabled: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}) => (
  <IconButton
    variant="outlined"
    color="secondary"
    size="small"
    aria-label={label}
    aria-disabled={disabled}
    className={classNames({[iconButtonClasses.disabled]: disabled})}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <FontAwesomeV6Icon iconName={icon} aria-hidden="true" />
  </IconButton>
);

const RowCard = ({
  front,
  rowNumber,
  row,
}: {
  front: boolean;
  rowNumber: number;
  row: DataRow;
}) => {
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const {project} = useProject();
  const titleId = useId();
  const detailsRef = useRef<HTMLDListElement>(null);

  // Coming back to a row would otherwise keep where its list was scrolled.
  useEffect(() => {
    if (front && detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  }, [front]);

  // Set on the DOM, not in state, so scrolling doesn't re-render the card.
  useEffect(() => {
    const el = detailsRef.current;
    const list = el?.parentElement;
    if (!el || !list) {
      return;
    }
    const update = () => {
      const scrollbar = el.offsetWidth - el.clientWidth;
      list.style.setProperty('--scrollbar-width', `${scrollbar}px`);
      // Allow 1px for subpixel scroll positions.
      list.toggleAttribute('data-fade-top', el.scrollTop > 1);
      list.toggleAttribute(
        'data-fade-bottom',
        el.scrollHeight - el.scrollTop - el.clientHeight > 1
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <article
      className={styles.card}
      aria-labelledby={titleId}
      aria-roledescription="slide"
    >
      <Typography
        id={titleId}
        component="h3"
        variant="body1"
        className={styles.title}
      >
        {`Row ${rowNumber}`}
      </Typography>
      <div className={styles.list}>
        <dl ref={detailsRef} className={styles.details}>
          {Object.keys(row).map(column => {
            const role = getColumnRole(project, column);
            return (
              <div key={column} className={styles.row}>
                <Typography
                  component="dt"
                  variant={role ? 'label1' : 'body2'}
                  className={styles.label}
                  data-role={role}
                >
                  {getLocalizedColumnName(datasetId, column)}
                  {role && (
                    <span className={appStyles.visuallyHidden}>
                      {role === 'label'
                        ? ', used as the label'
                        : ', used as a feature'}
                    </span>
                  )}
                </Typography>
                <Typography
                  component="dd"
                  variant="label1"
                  className={styles.value}
                >
                  {getLocalizedValue(row[column], datasetId)}
                </Typography>
              </div>
            );
          })}
        </dl>
      </div>
    </article>
  );
};

export default DatasetRowCards;
