import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

import {
  findTourAnchorAt,
  findTourAnchorElements,
  TourAnchor,
} from '../tourAnchors';

import styles from './authored-tour-editor.module.scss';

interface AnchorOutline {
  anchor: TourAnchor;
  element: Element;
  rect: DOMRect;
}

interface TourAnchorPickerProps {
  appName: string | undefined;
  // The editor panel. Clicks inside it are not picks.
  editorRef: React.RefObject<HTMLElement>;
  onPick: (anchor: TourAnchor) => void;
  onCancel: () => void;
}

const REMEASURE_MS = 300;

// Whether the element's middle is not covered by something else, such as an
// open dialog.
const isOnTop = (element: Element, rect: DOMRect) => {
  const hit = document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
  return !!hit && element.contains(hit);
};

// Outlines every part of the lab a step can point at, and takes the next
// click on one as the choice. The lab does not receive that click.
const TourAnchorPicker: React.FC<TourAnchorPickerProps> = ({
  appName,
  editorRef,
  onPick,
  onCancel,
}) => {
  const [outlines, setOutlines] = useState<AnchorOutline[]>([]);
  const [hovered, setHovered] = useState<Element>();

  const measure = useCallback(() => {
    setOutlines(
      findTourAnchorElements(appName).flatMap(({anchor, element}) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && isOnTop(element, rect)
          ? [{anchor, rect, element}]
          : [];
      })
    );
  }, [appName]);

  useEffect(() => {
    measure();
    const interval = setInterval(measure, REMEASURE_MS);
    window.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', measure);
      document.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  useEffect(() => {
    const inLab = (event: Event) =>
      event.target instanceof Element &&
      !editorRef.current?.contains(event.target);
    const anchorAt = (event: Event) =>
      inLab(event)
        ? findTourAnchorAt(appName, event.target as Element)
        : undefined;

    const onMouseMove = (event: MouseEvent) =>
      setHovered(anchorAt(event)?.element);
    const block = (event: Event) => {
      if (inLab(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!inLab(event)) {
        return;
      }
      block(event);
      const match = anchorAt(event);
      if (match) {
        onPick(match.anchor);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };

    const blocked = ['pointerdown', 'mousedown', 'pointerup', 'mouseup'];
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
    blocked.forEach(type => document.addEventListener(type, block, true));
    document.documentElement.classList.add(styles.picking);
    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      blocked.forEach(type => document.removeEventListener(type, block, true));
      document.documentElement.classList.remove(styles.picking);
    };
  }, [appName, editorRef, onPick, onCancel]);

  return ReactDOM.createPortal(
    <div className={styles.pickerLayer} aria-hidden="true">
      {outlines.map(({anchor, rect, element}, index) => (
        <div
          key={`${anchor.name}-${index}`}
          className={classNames(
            styles.anchorOutline,
            element === hovered && styles.anchorOutlineHovered
          )}
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        >
          {element === hovered && (
            <Typography variant="body4" className={styles.anchorLabel}>
              {anchor.label}
            </Typography>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
};

export default TourAnchorPicker;
