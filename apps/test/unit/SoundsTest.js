import {expect} from '../util/deprecatedChai';
import Sounds from '@cdo/apps/Sounds';
import sinon from 'sinon';
import winMp3 from '!!file-loader!../audio/assets/win.mp3';

describe('Sounds', () => {
  let sounds, sourceURL, sound, spy;

  beforeEach(() => {
    sounds = new Sounds();
    sourceURL = winMp3;
    sounds.register({id: sourceURL, mp3: sourceURL});
    sound = sounds.soundsById[sourceURL];
    spy = sinon.stub(sound, 'playAfterLoad');
  });

  afterEach(() => {
    spy.restore();
    sounds.unmuteURLs();
  });

  it('does not play URLs when muted', () => {
    sounds.muteURLs();
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).to.not.have.been.called;
  });

  it('does play URLs when unmuted', () => {
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).to.have.been.calledOnce;

    sounds.muteURLs();
    sounds.unmuteURLs();
    sounds.playURL(sourceURL);
    expect(sound.playAfterLoad).to.have.been.calledTwice;
  });

  it('does play sounds by ID when muted', () => {
    let soundId = 'testSound';
    sounds.register({id: soundId, mp3: sourceURL});
    sounds.muteURLs();

    let soundFromId = sounds.soundsById['testSound'];
    spy = sinon.stub(soundFromId, 'play');
    sounds.play(soundId);
    expect(soundFromId.play).to.have.been.calledOnce;
  });
});
