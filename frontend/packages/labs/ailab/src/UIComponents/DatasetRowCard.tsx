import {Typography} from '@mui/material';
import React, {useEffect, useId, useRef} from 'react';

import {getColumnRole, getLocalizedColumnName} from '../helpers/columnDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppSelector} from '../hooks';
import {useProject} from '../ProjectContext';
import type {DataRow} from '../types';

import appStyles from '../app.module.scss';
import styles from './datasetRowCard.module.scss';

interface DatasetRowCardProps {
  // False while the card animates off the deck.
  front: boolean;
  rowNumber: number;
  row: DataRow;
}

const DatasetRowCard = ({front, rowNumber, row}: DatasetRowCardProps) => {
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
        <dl
          ref={detailsRef}
          className={styles.details}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- focusable so keyboard users can scroll a long row
          tabIndex={front ? 0 : -1}
        >
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
    </div>
  );
};

export default DatasetRowCard;
