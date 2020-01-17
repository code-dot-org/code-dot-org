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
  }
};

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
    const component = mount(
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
    const component = mount(
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
    const component = mount(
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
    const component = mount(
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

  it('renders controls if text-to-speech is enabled and sound is loaded', function() {
    const component = mount(
      <StatelessInlineAudio {...DEFAULT_PROPS} textToSpeechEnabled />
    );

    expect(component.exists('.inline-audio')).to.be.false;
    component.setState({loaded: true});
    expect(component.exists('.inline-audio')).to.be.true;
  });

  it('can toggle audio', function() {
    const component = mount(<StatelessInlineAudio {...DEFAULT_PROPS} />);

    expect(component.state().playing).to.be.false;
    component.instance().toggleAudio();
    expect(component.state().playing).to.be.true;
    component.instance().toggleAudio();
    expect(component.state().playing).to.be.false;
  });

  it('only initializes Audio once', function() {
    sinon.spy(window, 'Audio');
    const component = mount(<StatelessInlineAudio {...DEFAULT_PROPS} />);

    expect(window.Audio).to.have.been.calledOnce;
    component.instance().playAudio();
    expect(window.Audio).to.have.been.calledOnce;
    component.instance().pauseAudio();
    expect(window.Audio).to.have.been.calledOnce;
    component.instance().playAudio();
    expect(window.Audio).to.have.been.calledOnce;
  });

  it('handles source update gracefully, stopping audio', function() {
    const component = mount(<StatelessInlineAudio {...DEFAULT_PROPS} />);
    component.instance().playAudio();

    component.setProps({src: 'state2'});
    expect(component.instance().state.audio).to.be.undefined;
    expect(component.instance().state.playing).to.be.false;
    expect(component.instance().state.error).to.be.false;
  });

  it('can toggle hover state', function() {
    const component = mount(<StatelessInlineAudio {...DEFAULT_PROPS} />);
    // Just checking that this doesn't cause error for now
    component.instance().toggleHover();
    component.instance().toggleHover();
  });
});

// Could extend this to have real EventTarget behavior,
// then write tests for 'ended' and 'error' events.
class FakeAudio {
  play() {}
  pause() {}
  load() {}
  // EventTarget interface
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
  removeAttribute() {}
}
