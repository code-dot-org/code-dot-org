import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import React from 'react';

import useThemeMode from '@cdo/apps/pixelEditor/useThemeMode';

import {World, worldSpriteImages} from '../../world';

const NO_PLAYER = '';

interface WorldPlayerPickerProps {
  world: World;
  onChange: (player: string | undefined) => void;
}

/** Which of the world's sprite images starts as the player. */
const WorldPlayerPicker: React.FunctionComponent<WorldPlayerPickerProps> = ({
  world,
  onChange,
}) => {
  const mode = useThemeMode();
  const images = worldSpriteImages(world);
  const player =
    world.player && images.includes(world.player) ? world.player : NO_PLAYER;
  return (
    <SimpleDropdown
      name="world-player"
      labelText="Player"
      size="s"
      color={mode === 'dark' ? 'white' : 'black'}
      disabled={!images.length}
      items={[
        {value: NO_PLAYER, text: images.length ? 'None' : 'Place a character'},
        ...images.map(image => ({value: image, text: image})),
      ]}
      selectedValue={player}
      onChange={event => onChange(event.target.value || undefined)}
    />
  );
};

export default WorldPlayerPicker;
