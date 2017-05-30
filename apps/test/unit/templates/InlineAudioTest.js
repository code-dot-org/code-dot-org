import {assert} from '../../util/configuredChai';
import {mount} from 'enzyme';
import {setExternalGlobals} from './../../util/testUtils';
import React from 'react';
import {StatelessInlineAudio} from '@cdo/apps/templates/instructions/InlineAudio';


describe('InlineAudio', function () {
  setExternalGlobals();

  it('uses a given src if there is one', function () {
    const src = 'test';
    const component = mount(
      <StatelessInlineAudio
        assetUrl={function () {}}
        isK1={true}
        locale="en_us"
        src={src}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(src, result);
  });

  it('generates a src from message text if none is given', function () {
    const component = mount(
      <StatelessInlineAudio
        assetUrl={function () {}}
        isK1={true}
        locale="en_us"
        message={'test'}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(result, "https://tts.code.org/sharon22k/180/100/098f6bcd4621d373cade4e832627b4f6/test.mp3");
  });

  it('can handle (select) non-english locales', function () {
    const component = mount(
      <StatelessInlineAudio
        assetUrl={function () {}}
        isK1={true}
        locale="it_it"
        message={'test'}
      />
    );

    const result = component.instance().getAudioSrc();
    assert.equal(result, "https://tts.code.org/vittorio22k/180/100/098f6bcd4621d373cade4e832627b4f6/test.mp3");
  });
});
