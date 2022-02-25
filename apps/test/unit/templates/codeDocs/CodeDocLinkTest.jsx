import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import CodeDocLink from '@cdo/apps/templates/codeDocs/CodeDocLink';

describe('CodeDocLink', () => {
  it('renders simple link when no blockName provided', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/applab/code',
          name: 'App Lab Code'
        }}
        showBlocks
      />
    );
    expect(wrapper.find('TextLink').length).to.equal(1);
    expect(
      wrapper
        .find('TextLink')
        .first()
        .props().href
    ).to.equal('/docs/applab/code');
    expect(wrapper.find('EmbeddedBlock').length).to.equal(0);
  });

  it('renders embedded block if blockName provided', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/spritelab/code',
          name: 'Sprite Lab Block',
          blockName: 'code_block'
        }}
        showBlocks
      />
    );
    expect(wrapper.find('TextLink').length).to.equal(0);
    expect(wrapper.find('EmbeddedBlock').length).to.equal(1);
  });

  it('renders simple link if showBlocks is false', () => {
    const wrapper = shallow(
      <CodeDocLink
        programmingExpression={{
          link: '/docs/spritelab/code',
          name: 'Sprite Lab Block',
          blockName: 'code_block'
        }}
        showBlocks={false}
      />
    );
    expect(wrapper.find('a').length).to.equal(1);
    expect(
      wrapper
        .find('a')
        .first()
        .props().href
    ).to.equal('/docs/spritelab/code');
    expect(wrapper.text().includes('Sprite Lab Block')).to.be.true;
    expect(wrapper.find('EmbeddedBlock').length).to.equal(0);
  });
});
