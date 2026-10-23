import {Typography} from '@mui/material';
import React, {useEffect, useId, useRef} from 'react';

import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import {getIdColumn} from '../selectors';
import type {DataRow} from '../types';

import styles from './datasetRowCard.module.scss';
import appStyles from '../app.module.scss';

interface DatasetRowCardProps {
  isCurrent: boolean;
  rowNumber: number;
  row: DataRow;
}

const DatasetRowCard = ({isCurrent, rowNumber, row}: DatasetRowCardProps) => {
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const idColumn = useAppSelector(getIdColumn);
  const {project} = useProject();
  const titleId = useId();
  const rowNumberId = useId();
  const detailsRef = useRef<HTMLDListElement>(null);

  // Coming back to a row would otherwise keep where its list was scrolled.
  useEffect(() => {
    if (isCurrent && detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  }, [isCurrent]);

  // Fade the list's top and bottom edges while there is more to scroll to,
  // and keep the fades clear of the scrollbar.
  useEffect(() => {
    const el = detailsRef.current;
    const list = el?.parentElement;
    if (!el || !list) {
      return;
    }
    const update = () => {
      // Written to the DOM rather than state, so scrolling doesn't re-render.
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
    <div
      className={styles.card}
      role="group"
      aria-labelledby={idColumn ? `${titleId} ${rowNumberId}` : titleId}
      aria-roledescription="slide"
    >
      <div className={styles.heading}>
        <Typography
          id={titleId}
          component="h3"
          variant="body1"
          className={styles.title}
        >
          {idColumn
            ? getLocalizedValue(row[idColumn], datasetId)
            : `Row ${rowNumber}`}
        </Typography>
        {idColumn && (
          <Typography
            id={rowNumberId}
            component="p"
            variant="body3"
            className={styles.rowNumber}
          >
            {`Row ${rowNumber}`}
          </Typography>
        )}
      </div>
      <div className={styles.list}>
        <dl
          ref={detailsRef}
          className={styles.details}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can scroll a long row
          tabIndex={isCurrent ? 0 : -1}
        >
          {Object.keys(row)
            .filter(column => column !== idColumn)
            .map(column => {
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
    </div>
  );
};

export default DatasetRowCard;
