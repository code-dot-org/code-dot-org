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
      />
    );
    expect(wrapper.find('Link').length).to.equal(1);
    expect(
      wrapper
        .find('Link')
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
      />
    );
    expect(wrapper.find('Link').length).to.equal(0);
    expect(wrapper.find('EmbeddedBlock').length).to.equal(1);
  });
});
