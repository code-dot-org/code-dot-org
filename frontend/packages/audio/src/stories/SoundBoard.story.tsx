import {Meta, StoryFn} from '@storybook/react';
import {useEffect, useRef} from 'react';

import {SoundBoard} from '@code-dot-org/audio';
import {Button} from '@code-dot-org/component-library/button';

export default {
  title: 'Platform/Audio',
  component: <div></div>,
} as Meta;

//
// TEMPLATE
//
const Template: StoryFn<AudioProps> = _ => {
  const soundBoard = useRef<SoundBoard>(new SoundBoard());
  useEffect(() => {
    soundBoard.current?.register({
      id: 'music',
      mp3: 'vignette2-quiet.mp3',
    });

    soundBoard.current?.register({
      id: 'sample',
      mp3: 'start.mp3',
    });

    soundBoard.current?.register({
      id: 'music_ogg',
      mp3: 'vignette2-quiet.ogg',
    });

    soundBoard.current?.register({
      id: 'sample_ogg',
      mp3: 'start.ogg',
    });
  }, [soundBoard]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <Button text="Play Long mp3" onClick={() => soundBoard.current?.play('music')}/>
        <Button text="Play Short mp3" onClick={() => soundBoard.current?.play('sample')}/>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <Button text="Play Long ogg" onClick={() => soundBoard.current?.play('music_ogg')}/>
        <Button text="Play Short ogg" onClick={() => soundBoard.current?.play('sample_ogg')}/>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <Button text="Pause All" onClick={() => soundBoard.current?.pauseSounds()}/>
        <Button text="Restart Paused" onClick={() => soundBoard.current?.restartPausedSounds()}/>
        <Button text="Stop All" onClick={() => soundBoard.current?.stopAllAudio()}/>
      </div>
    </div>
  );
};

export const SoundBoardTest = Template.bind({});
