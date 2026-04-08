import {useMemo, type PropsWithChildren} from 'react';

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import type {BlocklyProviderProps} from '@code-dot-org/blockly-workspace/contexts';
import {BlocklyProvider} from '@code-dot-org/blockly-workspace/contexts';
import type {LevelProperties} from '@code-dot-org/core/api';
import {useMaybeLevelProperties} from '../contexts/LevelPropertiesContext';
import {themes} from '@code-dot-org/blockly-workspace/themes';
import {useBlocklySettings} from '../hooks/useBlocklySettings';

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

  // Pull the theme from the user themes and supply this as the initial theme
  const {selectedValue: initialTheme} = useBlocklySettings()[0];
  const {theme: siteTheme} = useTheme();
  const suffix = siteTheme === 'Dark' ? '-dark' : '';

  const realizedBlocklyProps = useMemo(
    () =>
      levelProperties
        ? {
            theme: themes[`${initialTheme}${suffix}`],
            ...blocklyProps(levelProperties),
          }
        : {},
    [suffix, initialTheme, blocklyProps, levelProperties],
  );

  return levelProperties ? (
    <BlocklyProvider {...realizedBlocklyProps}>{children}</BlocklyProvider>
  ) : undefined;
};

/**
 * This wraps a lab that has a Blockly workspace and Blockly-based sources.
 *
 * This is a legacy Blockly-lab that uses the lastAttempt method of storing
 * progress or otherwise is not meant to interact with the Projects or
 * Sources APIs.
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
