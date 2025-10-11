import Sounds from '@cdo/apps/Sounds';

import winMp3 from '!!file-loader!../audio/assets/win.mp3';

describe('Sounds', () => {
  let sounds, sourceURL, sound;

  beforeEach(() => {
    sounds = new Sounds();
    sourceURL = winMp3;
    sounds.register({id: sourceURL, mp3: sourceURL});
    sound = sounds.soundsById[sourceURL];
    jest.spyOn(sound, 'playAfterLoad').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    sounds.unmuteURLs();
  });

  it('does not play URLs when muted', () => {
    sounds.muteURLs();
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).not.toHaveBeenCalled();
  });

  it('does play URLs when unmuted', () => {
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).toHaveBeenCalledTimes(1);

    sounds.muteURLs();
    sounds.unmuteURLs();
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).toHaveBeenCalledTimes(2);
  });

  it('does play sounds by ID when muted', () => {
    let soundId = 'testSound';
    sounds.register({id: soundId, mp3: sourceURL});
    sounds.muteURLs();

    let soundFromId = sounds.soundsById['testSound'];
    jest.spyOn(soundFromId, 'play').mockImplementation();
    sounds.play(soundId);
    expect(soundFromId.play).toHaveBeenCalledTimes(1);
  });
});
