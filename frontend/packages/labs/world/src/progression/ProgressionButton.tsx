// The way in: a button in the resource panel's bottom icon strip.
//
// It sits with Documentation, Copyright and Settings because it is about the
// SESSION rather than about the code — see specs/PROGRESSION_UI.md for why not
// a tab and why not the workspace header. The strip takes lab-contributed
// buttons through the base panel's `extraLinks` prop, which this feature added.

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {IconButtonWithTooltip} from '@code-dot-org/lab/components';

import {useProgression} from './progressionContext';

export const ProgressionButton = () => {
  const {theme} = useTheme();
  const {openTree} = useProgression();

  return (
    <IconButtonWithTooltip
      id="progression"
      label="Progression"
      icon={{iconName: 'map', iconStyle: 'solid'}}
      type="tertiary"
      color="gray"
      tooltipSize="xs"
      tooltipDirection="onRight"
      buttonSize="s"
      theme={theme}
      onClick={() => openTree()}
    />
  );
};
