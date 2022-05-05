import {expect} from '../util/reconfiguredChai';
import MusicController from '@cdo/apps/MusicController';
import sinon from 'sinon';
import Sounds from '@cdo/apps/Sounds';
import winMp3 from '!!file-loader!../audio/assets/win.mp3';

describe('MusicController', () => {
  let musicController, sound, sounds, sourceURL;

  sounds = new Sounds();
  sourceURL = winMp3;
  sounds.register({id: sourceURL, mp3: sourceURL});
  sound = sounds.soundsById[sourceURL];

  const defaultProps = {
    audioPlayer: new Sounds.getSingleton(),
    assetUrl: winMp3,
    trackDefinitions: [track],
    loopRandomWithDelay: null,
    muteMusic: false
  };

  const track = {
    name: 'track',
    assetUrls: winMp3,
    volume: 1,
    sound: sinon.stub(sound, 'play'),
    isLoaded: true,
    group: null
  };

  afterEach(() => {
    sinon.restore();
  });

  it('mutes itself when requested', () => {
    musicController = new MusicController(defaultProps);
    musicController.setMuteMusic(true);

    musicController.play();
    expect(musicController.muteMusic_).to.be.true;
    expect(sound.play).to.not.have.been.called;
  });

  it('updates status and plays music when unmuted', () => {
    musicController = new MusicController(defaultProps, {muteMusic: true});
    musicController.setMuteMusic(false);

    expect(musicController.muteMusic_).to.be.false;
    //expect(sound.play).to.have.been.called;
  });
});
