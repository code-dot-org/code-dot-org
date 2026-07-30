import * as BlocklyCore from 'blockly/core';
import {isEqual} from 'lodash';
import React, {useEffect, useRef} from 'react';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {sanitizeBehavior2Source} from '../blockly/behavior2';
import {SpriteLab2Behavior2} from '../types';

import useBlocklyWorkspace from './useBlocklyWorkspace';

import moduleStyles from './sprite-lab2-view.module.scss';

export const SYSTEMS_BLOCKLY_DIV_ID = 'spritelab2-systems-blockly-div';

// The system implementation language, as a single flyout (no categories —
// the whole language fits one strip, like the modal behavior editor). The
// value sockets carry number shadows so dragged blocks arrive runnable.
const numberShadow = (num: number) => ({
  shadow: {type: 'math_number', fields: {NUM: num}},
});
const SYSTEMS_TOOLBOX = {
  kind: 'flyoutToolbox',
  contents: [
    {kind: 'block', type: 'spritelab2_forEachSpriteOfType'},
    {kind: 'block', type: 'controls_if'},
    {kind: 'block', type: 'spritelab2_standingOnType'},
    {kind: 'block', type: 'spritelab2_keyIsHeld'},
    {
      kind: 'block',
      type: 'logic_compare',
      inputs: {B: numberShadow(0)},
    },
    {
      kind: 'block',
      type: 'spritelab2_setThisSprite',
      inputs: {VALUE: numberShadow(0)},
    },
    {
      kind: 'block',
      type: 'spritelab2_changeThisSprite',
      inputs: {VALUE: numberShadow(1)},
    },
    {kind: 'block', type: 'spritelab2_getThisSpriteProp'},
    {kind: 'block', type: 'spritelab2_systemSetting'},
    {
      kind: 'block',
      type: 'spritelab2_setStateForThisSprite',
      inputs: {VALUE: numberShadow(0)},
    },
    {kind: 'block', type: 'spritelab2_getStateForThisSprite'},
    {kind: 'block', type: 'spritelab2_thisSprite'},
    {kind: 'block', type: 'math_number'},
    {
      kind: 'block',
      type: 'math_arithmetic',
      inputs: {A: numberShadow(0), B: numberShadow(0)},
    },
  ],
} as unknown as BlocklyCore.utils.toolbox.ToolboxInfo;

interface Behavior2TabProps {
  // Gates workspace injection (Blockly environment readiness, same gate as
  // the Code tab's workspace).
  enabled: boolean;
  theme: 'Light' | 'Dark';
  // The system currently selected in the tab-bar dropdown.
  system: SpriteLab2Behavior2;
  onSourceChange: (name: string, source: WorkspaceSerialization) => void;
}

/**
 * The Systems tab: one Blockly workspace showing the selected system's
 * implementation. Edits save through onSourceChange, attributed to whichever
 * system was selected when the edit landed.
 */
const Behavior2Tab: React.FunctionComponent<Behavior2TabProps> = ({
  enabled,
  theme,
  system,
  onSourceChange,
}) => {
  const {getCurrentBlocks, loadCode, subscribeToChanges} = useBlocklyWorkspace({
    enabled,
    toolboxDefinition: SYSTEMS_TOOLBOX,
    theme,
    divId: SYSTEMS_BLOCKLY_DIV_ID,
  });

  // Show the selected system. The isEqual guard keeps the workspace from
  // reloading on its own save echo (sources update -> system prop changes).
  // Sanitized: a source saved with stale ORPHANED flags must not render (or
  // re-save) disabled.
  useEffect(() => {
    const source = sanitizeBehavior2Source(system.source);
    if (!enabled || !source) {
      return;
    }
    if (isEqual(getCurrentBlocks(), source)) {
      return;
    }
    loadCode(source);
  }, [enabled, system, getCurrentBlocks, loadCode]);

  // Persist edits. By-ref so the one subscription reads the current
  // selection and handler at edit time.
  const systemNameRef = useRef(system.name);
  systemNameRef.current = system.name;
  const onSourceChangeRef = useRef(onSourceChange);
  onSourceChangeRef.current = onSourceChange;
  useEffect(
    () =>
      subscribeToChanges(source =>
        onSourceChangeRef.current(systemNameRef.current, source)
      ),
    [subscribeToChanges]
  );

  return (
    <div id={SYSTEMS_BLOCKLY_DIV_ID} className={moduleStyles.blocklyDiv} />
  );
};

export default Behavior2Tab;
