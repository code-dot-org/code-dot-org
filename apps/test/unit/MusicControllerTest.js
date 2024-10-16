import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import MusicController from '@cdo/apps/MusicController';
import Sounds from '@cdo/apps/Sounds';

import {expect} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import winMp3 from '!!file-loader!../audio/assets/win.mp3';

describe('MusicController', () => {
  const track = {
    volume: 1,
    hasOgg: false,
    name: 'win',
    isloaded: false,
    group: 'mygroup',
  };

  let musicController, sound, sounds, sourceURL;

  beforeEach(() => {
    sounds = new Sounds();
    sourceURL = winMp3;
    sounds.register({
      id: winMp3,
      mp3: winMp3,
    });
    sound = sounds.soundsById[sourceURL];
    sinon.spy(sound, 'play');
    sinon.stub(Sounds.prototype, 'registerByFilenamesAndID').returns(sound);
  });

  afterEach(() => {
    Sounds.prototype.registerByFilenamesAndID.restore();
    sound.play.restore();
  });

  function musicControllerSetup(isMutedToStart) {
    return new MusicController(
      Sounds.getSingleton(),
      filename => {
        `../audio/assets/${filename}`;
      },
      [track],
      null,
      isMutedToStart
    );
  }

  it('mutes itself when requested', () => {
    musicController = musicControllerSetup(false);
    musicController.preload();
    sound.onLoad();
    musicController.setMuteMusic(true);

    expect(musicController.muteMusic_).to.be.true;
    // Make sure attempts to play do not work since muting
    musicController.play();
    expect(sound.play).to.not.have.been.called;
  });

  it('updates status and plays music when unmuted', () => {
    musicController = musicControllerSetup(true);
    musicController.setGroup('mygroup');
    musicController.preload();
    sound.onLoad();

    expect(sound.play).to.not.have.been.called;
    musicController.setMuteMusic(false);
    expect(musicController.muteMusic_).to.be.false;
    expect(sound.play).to.have.been.called;
  });
});
