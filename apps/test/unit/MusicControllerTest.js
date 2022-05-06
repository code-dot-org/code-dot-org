import {expect} from '../util/reconfiguredChai';
import MusicController from '@cdo/apps/MusicController';
import sinon from 'sinon';
import Sounds from '@cdo/apps/Sounds';
import winMp3 from '!!file-loader!../audio/assets/win.mp3';

describe('MusicController', () => {
  const track = {
    volume: 1,
    hasOgg: false,
    name: 'win',
    isloaded: false,
    group: 'mygroup'
  };

  let musicController, sound, sounds, sourceURL;

  beforeEach(() => {
    sounds = new Sounds();
    sourceURL = winMp3;
    sounds.register({
      id: winMp3,
      mp3: winMp3
    });
    sound = sounds.soundsById[sourceURL];
    sinon.spy(sound, 'play');
    sinon.stub(Sounds.prototype, 'registerByFilenamesAndID').returns(sound);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('mutes itself when requested', () => {
    musicController = new MusicController(
      new Sounds.getSingleton(),
      function(filename) {
        return `../audio/assets/${filename}`;
      },
      [track],
      null,
      false
    );
    musicController.preload();
    sound.onLoad();
    musicController.setMuteMusic(true);

    musicController.play();
    expect(musicController.muteMusic_).to.be.true;
    expect(sound.play).to.not.have.been.called;
  });

  it('updates status and plays music when unmuted', () => {
    musicController = new MusicController(
      new Sounds.getSingleton(),
      function(filename) {
        return `../audio/assets/${filename}`;
      },
      [track],
      null,
      true
    );

    musicController.setGroup('mygroup');
    musicController.preload();
    sound.onLoad();
    musicController.setMuteMusic(false);

    expect(musicController.muteMusic_).to.be.false;
    expect(sound.play).to.have.been.called;
  });
});
