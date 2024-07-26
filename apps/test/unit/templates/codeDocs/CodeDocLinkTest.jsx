import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CodeDocLink from '@cdo/apps/templates/codeDocs/CodeDocLink';

describe('CodeDocLink', () => {
  it('renders simple link when no blockName provided', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/applab/code',
          name: 'App Lab Code',
        }}
        showBlocks
      />
    );
    expect(wrapper.find('TextLink').length).toBe(1);
    expect(wrapper.find('TextLink').first().props().href).toBe(
      '/docs/applab/code'
    );
    expect(wrapper.find('EmbeddedBlock').length).toBe(0);
  });

  it('renders embedded block if blockName provided', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/spritelab/code',
          name: 'Sprite Lab Block',
          blockName: 'code_block',
        }}
        showBlocks
      />
    );
    expect(wrapper.find('TextLink').length).toBe(0);
    expect(wrapper.find('EmbeddedBlock').length).toBe(1);
  });

  it('renders simple link if showBlocks is false', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/spritelab/code',
          name: 'Sprite Lab Block',
          blockName: 'code_block',
        }}
        showBlocks={false}
      />
    );
    expect(wrapper.find('TextLink').length).toBe(1);
    expect(wrapper.find('TextLink').first().props().href).toBe(
      '/docs/spritelab/code'
    );
    expect(wrapper.find('EmbeddedBlock').length).toBe(0);
  });
});
