import {assert, expect} from '../../../util/deprecatedChai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {setExternalGlobals} from '../../../util/testUtils';
import React from 'react';
import {StatelessInlineAudio} from '@cdo/apps/templates/instructions/InlineAudio';

const DEFAULT_PROPS = {
  assetUrl: () => {},
  isK1: true,
  locale: 'it_it',
  src: 'test_source',
  textToSpeechEnabled: true,
  style: {
    button: {},
    buttonImg: {}
  },
  ttsAutoplayEnabled: false
};

// this is a helper function which is used in a test to
// wait for all preceeding promises to resolve
const waitForPromises = async () => {
  return Promise.resolve();
};

function getComponent(element) {
  const wrapper = mount(element);
  return wrapper.at(0);
}

describe('InlineAudio', function() {
  setExternalGlobals();

  let windowAudio;

  beforeEach(() => {
    windowAudio = window.Audio;
    window.Audio = FakeAudio;
  });

  afterEach(() => {
    window.Audio = windowAudio;
  });

  it('uses a given src if there is one', function() {
    const src = 'test';
    const component = getComponent(
      <StatelessInlineAudio
        assetUrl={function() {}}
        isK1={true}
        locale="en_us"
        src={src}
      />
    );
    const result = component.instance().getAudioSrc();
    assert.equal(src, result);
  });

  it('generates a src from message text if none is given', function() {
    const component = getComponent(
      <StatelessInlineAudio
        assetUrl={function() {}}
        isK1={true}
        locale="en_us"
        message={'test'}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(
      result,
      'https://tts.code.org/sharon22k/180/100/098f6bcd4621d373cade4e832627b4f6/test.mp3'
    );
  });

  it('does not generate src from message text if no voice is available for locale', function() {
    const component = getComponent(
      <StatelessInlineAudio
        assetUrl={function() {}}
        isK1={true}
        locale="aa_aa"
        message={'test'}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(result, undefined);
  });

  it('can handle (select) non-english locales', function() {
    const component = getComponent(
      <StatelessInlineAudio
        assetUrl={function() {}}
        isK1={true}
        locale="it_it"
        message={'test'}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(
      result,
      'https://tts.code.org/vittorio22k/180/100/098f6bcd4621d373cade4e832627b4f6/test.mp3'
    );
  });

  it.skip('renders controls if text-to-speech is enabled and sound is loaded', function() {
    const component = getComponent(
      <StatelessInlineAudio {...DEFAULT_PROPS} textToSpeechEnabled />
    );

    expect(component.find('.inline-audio').exists()).to.be.false;
    component.instance().setState({loaded: true});
    expect(component.find('.inline-audio').exists()).to.be.true;
  });

  it('can toggle audio', async function() {
    const component = getComponent(<StatelessInlineAudio {...DEFAULT_PROPS} />);

    expect(component.state().playing).to.be.false;
    component.instance().toggleAudio();
    await waitForPromises();
    expect(component.state().playing).to.be.true;
    component.instance().toggleAudio();
    await waitForPromises();
    expect(component.state().playing).to.be.false;
  });

  it('autoplays if autoplay of text-to-speech is enabled', async function() {
    const component = mount(
      <StatelessInlineAudio
        assetUrl={function() {}}
        ttsAutoplayEnabled={true}
      />
    );

    await waitForPromises();
    expect(component.state().playing).to.be.true;
  });

  it('when playAudio resolves, state.playing set to true', async () => {
    const component = mount(
      <StatelessInlineAudio
        assetUrl={function() {}}
        ttsAutoplayEnabled={false}
      />
    );

    expect(component.state().playing).to.be.false;
    await component.instance().playAudio();
    expect(component.state().playing).to.be.true;
  });

  it('only initializes Audio once', function() {
    sinon.spy(window, 'Audio');
    const component = getComponent(<StatelessInlineAudio {...DEFAULT_PROPS} />);

    expect(window.Audio).to.have.been.calledOnce;
    component.instance().playAudio();
    expect(window.Audio).to.have.been.calledOnce;
    component.instance().pauseAudio();
    expect(window.Audio).to.have.been.calledOnce;
    component.instance().playAudio();
    expect(window.Audio).to.have.been.calledOnce;
  });

  it.skip('handles source update gracefully, stopping audio', function() {
    const component = getComponent(<StatelessInlineAudio {...DEFAULT_PROPS} />);
    component.instance().playAudio();

    component.setProps({src: 'state2'});
    expect(component.instance().state.audio).to.be.undefined;
    expect(component.instance().state.playing).to.be.false;
    expect(component.instance().state.error).to.be.false;
  });

  it('can toggle hover state', function() {
    const component = getComponent(<StatelessInlineAudio {...DEFAULT_PROPS} />);
    // Just checking that this doesn't cause error for now
    component.instance().toggleHover();
    component.instance().toggleHover();
  });
});

// Could extend this to have real EventTarget behavior,
// then write tests for 'ended' and 'error' events.
class FakeAudio {
  play() {
    return Promise.resolve();
  }
  pause() {}
  load() {}
  // EventTarget interface
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
  removeAttribute() {}
}
