import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Example from '@cdo/apps/templates/codeDocs/Example';

describe('Example', () => {
  it('embeds app without code', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is the code that the embedded app uses```',
      app: '/p/applab/abcde',
      app_display_type: 'codeFromCodeField',
    };
    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('h3').text()).toBe('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(2);
    const flexBox = wrapper.find('div').first();
    expect(flexBox.props().style['display']).toBe('flex');
    const app = flexBox.find('iframe');
    expect(app).not.toBeNull();
    expect(app.props().src).toBe('/p/applab/abcde/embed');
  });

  it('embeds app with code', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      app: '/p/spritelab/abcde',
      app_display_type: 'embedAppWithCode',
    };
    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="spritelab" />
    );
    expect(wrapper.find('h3').text()).toBe('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(1);
    const div = wrapper.find('div').first();
    expect(div.props().style['display']).not.toBe('flex');
    const app = wrapper.find('iframe');
    expect(app).not.toBeNull();
    expect(app.props().src).toBe('/p/spritelab/abcde/embed_app_and_code');
  });

  it('embeds example without app', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is some example code```',
      app_display_type: 'codeFromCodeField',
    };

    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('iframe').length).toBe(0);
    expect(wrapper.find('h3').text()).toBe('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(2);
  });

  it('embeds example with image', () => {
    const example = {
      name: 'Example 1',
      description: 'An example',
      code: '```This is some example code```',
      app_display_type: 'codeFromCodeField',
      image: '/image.png',
    };

    const wrapper = shallow(
      <Example example={example} programmingEnvironmentName="applab" />
    );
    expect(wrapper.find('iframe').length).toBe(0);
    expect(wrapper.find('h3').text()).toBe('Example 1');
    expect(wrapper.find('EnhancedSafeMarkdown').length).toBe(2);
    expect(wrapper.find('img').length).toBe(1);
    expect(wrapper.find('img').props().src).toBe('/image.png');
  });
});
