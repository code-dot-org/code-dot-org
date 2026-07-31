import {Button, Paper} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';

import {translate} from '../localization';
import type {EffectPortType, EffectValueType} from '../model/types';

import {portColor, portTypeLabel} from './portTypes';
import {componentLabel, type SwizzlePlan} from './swizzle';
import styles from './SwizzlePicker.module.css';

export interface SwizzlePickerProps {
  /** How many components to ask for, and what the source has. */
  plan: SwizzlePlan;
  /** What the wire carries before narrowing, for the heading and the dot. */
  sourceType: EffectPortType;
  /** Learner-facing name of the port being wired into. */
  targetLabel: string;
  /** Position within the canvas container, in CSS pixels. */
  position: {left: number; top: number};
  /** Called with the finished canonical swizzle, e.g. `'x'` or `'zy'`. */
  onPick: (swizzle: string) => void;
  onDismiss: () => void;
}

/** Placeholder for a component not chosen yet. */
const EMPTY_SLOT = '·';

/**
 * The menu shown when a wide wire lands on a narrower port.
 *
 * It opens at the connection point, because that is where the question is:
 * "this color has four numbers in it — which one goes here?" A port that wants
 * several components asks the same question once per slot, in order, and
 * commits as soon as the last one is answered — so the common single-component
 * case is still one click. Order is the whole point: `.zy` is not `.yz`, and a
 * menu of every ordered pair would be unreadable long before it was complete.
 *
 * Nothing reaches the document until the selection finishes, so dismissing
 * leaves the graph exactly as it was.
 */
export function SwizzlePicker({
  plan,
  sourceType,
  targetLabel,
  position,
  onPick,
  onDismiss,
}: SwizzlePickerProps) {
  const [picked, setPicked] = useState('');
  const {componentsNeeded, available} = plan;

  const choose = useCallback(
    (component: string) => {
      const next = picked + component;
      if (next.length >= componentsNeeded) {
        onPick(next);
        return;
      }
      setPicked(next);
    },
    [picked, componentsNeeded, onPick],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
        return;
      }
      if (event.key === 'Backspace') {
        event.preventDefault();
        setPicked(current => current.slice(0, -1));
        return;
      }
      // The letters on screen are the shortcuts — no need to aim at a button.
      const match = available.find(
        option => option.label.toLowerCase() === event.key.toLowerCase(),
      );
      if (match) {
        choose(match.swizzle);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [available, choose, onDismiss]);

  return (
    <>
      {/* Catches the click that would otherwise land on the canvas, so
          dismissing never also deselects or starts a pan. */}
      <div
        className={styles.backdrop}
        onPointerDown={onDismiss}
        aria-hidden="true"
      />
      <Paper
        className={styles.menu}
        style={{left: position.left, top: position.top}}
        aria-label={translate('Choose which part of the value to use')}
      >
        <p className={styles.heading}>
          <span
            className={styles.wireDot}
            style={{backgroundColor: portColor(sourceType)}}
            aria-hidden="true"
          />
          {componentsNeeded === 1
            ? translate('Which part of this {type} goes into "{name}"?', {
                type: portTypeLabel(sourceType),
                name: targetLabel,
              })
            : translate('Which parts of this {type} go into "{name}"?', {
                type: portTypeLabel(sourceType),
                name: targetLabel,
              })}
        </p>

        {/* One slot per component the port wants, so the *order* being built
            is visible while it is being built. */}
        {componentsNeeded > 1 && (
          <div className={styles.slots}>
            {Array.from({length: componentsNeeded}, (_unused, index) => (
              <span
                key={index}
                className={`${styles.slot} ${
                  index === picked.length ? styles.slotActive : ''
                }`}
              >
                {picked[index]
                  ? componentLabel(sourceType as EffectValueType, picked[index])
                  : EMPTY_SLOT}
              </span>
            ))}
          </div>
        )}

        <div className={styles.options}>
          {available.map(option => (
            <Button
              key={option.swizzle}
              className={styles.component}
              variant="outlined"
              onClick={() => choose(option.swizzle)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className={styles.actions}>
          {picked.length > 0 && (
            <Button
              className={styles.action}
              onClick={() => setPicked(current => current.slice(0, -1))}
            >
              {translate('Back')}
            </Button>
          )}
          <Button className={styles.action} onClick={onDismiss}>
            {translate('Cancel')}
          </Button>
        </div>
      </Paper>
    </>
  );
}
