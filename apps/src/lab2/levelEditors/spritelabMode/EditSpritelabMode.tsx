import React, {useEffect, useState} from 'react';

import {LevelMode} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

import {cleanLevelMode, LevelModeObject} from './spritelabMode';
import SpritelabModeFields from './SpritelabModeFields';

interface EditSpritelabModeProps {
  initialMode: LevelModeObject | null;
  initialUsesLab2: boolean;
  // Calls back with the Lab 2 checkbox's new state; returns an unsubscribe.
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void;
}

const EditSpritelabMode: React.FunctionComponent<EditSpritelabModeProps> = ({
  initialMode,
  initialUsesLab2,
  subscribeToUsesLab2,
}) => {
  const [usesLab2, setUsesLab2] = useState(initialUsesLab2);
  const [{mode, removed}, setState] = useState(() =>
    cleanLevelMode(initialMode ?? {})
  );

  useEffect(() => subscribeToUsesLab2?.(setUsesLab2), [subscribeToUsesLab2]);

  const handleChange = (newMode: Partial<LevelMode>) =>
    setState(current => ({...current, mode: newMode}));

  return (
    <div>
      <input
        id="level_level_mode"
        name="level[level_mode]"
        type="hidden"
        value={JSON.stringify(mode)}
      />
      <SpritelabModeFields
        mode={mode}
        removed={removed}
        usesLab2={usesLab2}
        onChange={handleChange}
      />
    </div>
  );
};

export default EditSpritelabMode;
