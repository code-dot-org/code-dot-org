/* One dataset row at a time, as the top card of a deck. */
import {IconButton, iconButtonClasses, Typography} from '@mui/material';
import classNames from 'classnames';
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {
  type ColumnRole,
  getColumnRole,
  getLocalizedColumnName,
} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {AilabProject, DataRow} from '../types';

import appStyles from '../app.module.scss';
import styles from './datasetRowCards.module.scss';

const DECK_PEEK = 2;

const ROLE_DESCRIPTIONS: Record<ColumnRole, string> = {
  label: 'used as the label',
  feature: 'used as a feature',
};

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
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const {project} = useProject();
  const total = data.length;
  const columns = Object.keys(data[0]);
  const atStart = rowIndex === 0;
  const atEnd = rowIndex === total - 1;
  // The card that just left, the front card, the ones peeking, and one waiting to fade in.
  const windowStart = Math.max(0, rowIndex - 1);
  const windowEnd = Math.min(total, rowIndex + DECK_PEEK + 2);

  const previous = () => {
    if (!atStart) {
      onRowIndexChange(rowIndex - 1);
    }
  };

  const next = () => {
    if (!atEnd) {
      onRowIndexChange(rowIndex + 1);
    }
  };

  // The stage can't take focus, so the pager buttons carry the deck's keys.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      previous();
    } else if (event.key === 'Home') {
      event.preventDefault();
      onRowIndexChange(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onRowIndexChange(total - 1);
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
        <div
          className={styles.deck}
          style={{'--deck-peek': DECK_PEEK} as CSSProperties}
        >
          {data.slice(windowStart, windowEnd).map((row, offset) => {
            // Keyed by dataset row, so a flip animates instead of remounting.
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
                    columns={columns}
                    datasetId={datasetId}
                    project={project}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.footer}>
        <nav className={styles.pager} aria-label="Card navigation">
          {/* aria-disabled rather than disabled, so focus stays on the button at either end. */}
          <IconButton
            variant="outlined"
            color="secondary"
            size="small"
            aria-label="Previous row"
            aria-disabled={atStart}
            className={classNames({[iconButtonClasses.disabled]: atStart})}
            onClick={previous}
            onKeyDown={onKeyDown}
          >
            <FontAwesomeV6Icon iconName="chevron-left" aria-hidden="true" />
          </IconButton>
          <Typography
            component="span"
            variant="body3"
            className={styles.counter}
            aria-live="polite"
          >
            {`Row ${rowIndex + 1} of ${total}`}
          </Typography>
          <IconButton
            variant="outlined"
            color="secondary"
            size="small"
            aria-label="Next row"
            aria-disabled={atEnd}
            className={classNames({[iconButtonClasses.disabled]: atEnd})}
            onClick={next}
            onKeyDown={onKeyDown}
          >
            <FontAwesomeV6Icon iconName="chevron-right" aria-hidden="true" />
          </IconButton>
        </nav>
      </div>
    </div>
  );
};

const RowCard = ({
  front,
  rowNumber,
  row,
  columns,
  datasetId,
  project,
}: {
  front: boolean;
  rowNumber: number;
  row: DataRow;
  columns: string[];
  datasetId: string;
  project: AilabProject;
}) => {
  const titleId = useId();
  const detailsRef = useRef<HTMLDListElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Coming back to a row would otherwise keep where its list was scrolled.
  useEffect(() => {
    if (front && detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  }, [front]);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) {
      return;
    }
    const update = () => {
      setScrollbarWidth(el.offsetWidth - el.clientWidth);
      // Allow 1px for subpixel scroll positions.
      setFadeTop(el.scrollTop > 1);
      setFadeBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 1);
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
      <div
        className={styles.list}
        style={{'--scrollbar-width': `${scrollbarWidth}px`} as CSSProperties}
      >
        <dl ref={detailsRef} className={styles.details}>
          {columns.map(column => {
            const name = getLocalizedColumnName(datasetId, column);
            const role = getColumnRole(project, column);
            const isLabel = role === 'label';
            const isFeature = role === 'feature';
            return (
              <div key={column} className={styles.row}>
                <Typography
                  component="dt"
                  variant={role ? 'label1' : 'body2'}
                  className={classNames(styles.label, {
                    [styles.labelName]: isLabel,
                    [styles.featureName]: isFeature,
                  })}
                >
                  <span className={styles.labelText}>{name}</span>
                  {role && (
                    <>
                      <span
                        className={classNames(styles.dot, {
                          [styles.dotLabel]: isLabel,
                          [styles.dotFeature]: isFeature,
                        })}
                        aria-hidden="true"
                      />
                      <span className={appStyles.visuallyHidden}>
                        {`, ${ROLE_DESCRIPTIONS[role]}`}
                      </span>
                    </>
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
        {fadeTop && <div className={styles.fadeTop} aria-hidden="true" />}
        {fadeBottom && <div className={styles.fadeBottom} aria-hidden="true" />}
      </div>
    </article>
  );
};

export default DatasetRowCards;
