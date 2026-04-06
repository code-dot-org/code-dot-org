import {useMemo, type PropsWithChildren} from 'react';

import type {BlocklyProviderProps} from '@code-dot-org/blockly-workspace/contexts';
import {BlocklyProvider} from '@code-dot-org/blockly-workspace/contexts';
import type {LevelProperties} from '@code-dot-org/core/api';
import {useMaybeLevelProperties} from '../contexts/LevelPropertiesContext';

import Lab, {type LabProps} from './Lab';

export interface BlocklyLabProps<T extends LevelProperties = LevelProperties>
  extends LabProps {
  blocklyProps: (levelProperties: T) => BlocklyProviderProps;
}

const BlocklyLabWrapper = <T extends LevelProperties = LevelProperties>({
  children,
  blocklyProps,
}: Pick<BlocklyLabProps<T>, 'blocklyProps'> & PropsWithChildren) => {
  const levelProperties = useMaybeLevelProperties<T>();

  const realizedBlocklyProps = useMemo(
    () => (levelProperties ? blocklyProps(levelProperties) : {}),
    [blocklyProps, levelProperties],
  );

  return levelProperties ? (
    <BlocklyProvider {...realizedBlocklyProps}>{children}</BlocklyProvider>
  ) : undefined;
};

/**
 * This wraps a lab that has a Blockly workspace and Blockly-based sources.
 *
 * Effectively, this is a special case of a LabWithSources that understands that
 * the sources are meant to be some kind of Blockly serialization.
 */
const BlocklyLab = <T extends LevelProperties = LevelProperties>({
  children,
  blocklyProps,
  ...props
}: BlocklyLabProps<T>) => {
  return (
    <Lab {...props}>
      <BlocklyLabWrapper<T> blocklyProps={blocklyProps}>
        {children}
      </BlocklyLabWrapper>
    </Lab>
  );
};

export default BlocklyLab;
