import {expect} from '../util/reconfiguredChai';
import MusicController from '@cdo/apps/MusicController';
import sinon from 'sinon';
import Sounds from '@cdo/apps/Sounds';
import winMp3 from '!!file-loader!../audio/assets/win.mp3';

const defaultProps = {
  audioPlayer: new Sounds.getSingleton(),
  assetUrl: winMp3,
  trackDefinitions: [],
  loopRandomWithDelay: null,
  muteMusic: false
};

describe('MusicController', () => {
  let musicController;

  beforeEach(() => {
    //sinon.stub(sound, 'playAfterLoad');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('mutes itself when requested', () => {
    musicController = new MusicController(defaultProps);
    musicController.setMuteMusic(true);
    musicController.play();
    expect(musicController.muteMusic).to.be.true;
    //expect(sound.playAfterLoad).to.not.have.been.called;
  });

  it('updates status and plays music when unmuted', () => {
    musicController = new MusicController(defaultProps, {muteMusic: true});
    musicController.setMuteMusic(false);
    expect(musicController.muteMusic).to.be.false;
    //expect(sound.playAfterLoad).to.have.been.called;
  });
});
