import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Example from '@cdo/apps/templates/codeDocs/Example';

describe('Example', () => {
  it('embeds app without code', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is the code that the embedded app uses```',
      app: '/p/applab/abcde',
      app_display_type: 'codeFromCodeField'
    };
    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('h3').text()).to.equal('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(2);
    const flexBox = wrapper.find('div').first();
    expect(flexBox.props().style['display']).to.equal('flex');
    const app = flexBox.find('iframe');
    expect(app).to.not.be.null;
    expect(app.props().src).to.equal('/p/applab/abcde/embed');
  });

  it('embeds app with code', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      app: '/p/spritelab/abcde',
      app_display_type: 'embedAppWithCode'
    };
    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="spritelab" />
    );
    expect(wrapper.find('h3').text()).to.equal('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(1);
    const div = wrapper.find('div').first();
    expect(div.props().style['display']).to.not.equal('flex');
    const app = wrapper.find('iframe');
    expect(app).to.not.be.null;
    expect(app.props().src).to.equal('/p/spritelab/abcde/embed_app_and_code');
  });

  it('embeds example without app', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is some example code```',
      app_display_type: 'codeFromCodeField'
    };

    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('iframe').length).to.equal(0);
    expect(wrapper.find('h3').text()).to.equal('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(2);
  });

  it('embeds example with image', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is some example code```',
      app_display_type: 'codeFromCodeField',
      imageUrl: '/image.png'
    };

    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('iframe').length).to.equal(0);
    expect(wrapper.find('h3').text()).to.equal('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).to.equal(2);
    expect(wrapper.find('img').length).to.equal(1);
    expect(wrapper.find('img').props().src).to.equal('/image.png');
  });
});
