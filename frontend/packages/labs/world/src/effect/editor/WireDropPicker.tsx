import {MenuItem, MenuList, Paper} from '@mui/material';
import {useEffect} from 'react';

import {translate} from '../localization';
import type {EffectPortType} from '../model/types';

import type {ConnectableNode} from './connectionRules';
import {nodeDisplayDescription, nodeDisplayLabel} from './labels';
import {portColor, portTypeLabel} from './portTypes';
import styles from './WireDropPicker.module.css';

export interface WireDropPickerProps {
  /** Nodes that could terminate the dangling wire, already filtered. */
  options: readonly ConnectableNode[];
  /** Type the wire carries, shown so the filtering explains itself. */
  wireType: EffectPortType;
  /** Position within the canvas container, in CSS pixels. */
  position: {left: number; top: number};
  onPick: (option: ConnectableNode) => void;
  onDismiss: () => void;
}

/**
 * The menu offered when a wire is dropped on empty canvas.
 *
 * Only nodes with a compatible port are listed, which quietly teaches the
 * type system: drop a texture wire and Sample is the whole menu; drop a number
 * and the math library appears. Picking one places the node at the drop point
 * already connected — building forward without a trip back to the palette.
 */
export function WireDropPicker({
  options,
  wireType,
  position,
  onPick,
  onDismiss,
}: WireDropPickerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <>
      {/* Catches the click that would otherwise land on the canvas, so
          dismissing the menu never also deselects or starts a pan. */}
      <div
        className={styles.backdrop}
        onPointerDown={onDismiss}
        aria-hidden="true"
      />
      <Paper
        className={styles.menu}
        style={{left: position.left, top: position.top}}
      >
        <p className={styles.heading}>
          <span
            className={styles.wireDot}
            style={{backgroundColor: portColor(wireType)}}
            aria-hidden="true"
          />
          {translate('Connect this {type} to…', {
            type: portTypeLabel(wireType),
          })}
        </p>
        {options.length > 0 ? (
          <MenuList
            dense
            className={styles.list}
            aria-label={translate('Add a connected node')}
          >
            {options.map(option => (
              <MenuItem
                key={option.definition.type}
                title={nodeDisplayDescription(option.definition)}
                onClick={() => onPick(option)}
              >
                {nodeDisplayLabel(option.definition)}
              </MenuItem>
            ))}
          </MenuList>
        ) : (
          <p className={styles.empty}>
            {translate('No node can take this wire.')}
          </p>
        )}
      </Paper>
    </>
  );
}
