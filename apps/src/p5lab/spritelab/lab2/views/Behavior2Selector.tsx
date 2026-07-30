import React from 'react';

import {SpriteLab2Behavior2} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

interface Behavior2SelectorProps {
  behavior2s: SpriteLab2Behavior2[];
  activeName: string;
  // Disabled off the Systems tab, where switching has no effect.
  disabled?: boolean;
  onSelect: (name: string) => void;
}

/**
 * System picker in the tab bar: choose which system implementation the
 * Systems tab shows. Mirrors SceneSelector; no create option — the
 * prototype's systems are the fixed built-in pair.
 */
const Behavior2Selector: React.FunctionComponent<Behavior2SelectorProps> = ({
  behavior2s,
  activeName,
  disabled,
  onSelect,
}) => (
  <select
    className={moduleStyles.sceneSelect}
    value={activeName}
    onChange={e => onSelect(e.target.value)}
    disabled={disabled}
    aria-label="System"
  >
    {behavior2s.map(({name}) => (
      <option key={name} value={name}>
        {name}
      </option>
    ))}
  </select>
);

export default Behavior2Selector;
