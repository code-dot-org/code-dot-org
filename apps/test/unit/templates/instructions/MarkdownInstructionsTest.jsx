import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {setExternalGlobals} from '../../../util/testUtils';
import MarkdownInstructions from '@cdo/apps/templates/instructions/MarkdownInstructions';

describe('MarkdownInstructions', function () {
  before(setExternalGlobals);

  it('standard case had top padding and no left margin', function () {
    const wrapper = shallow(
      <MarkdownInstructions
        markdown="md"
        markdownClassicMargins={false}
        inTopPane={false}
        noInstructionsWhenCollapsed={true}
      />
    );

    const containerElement = wrapper.find('.instructions-markdown').first();
    expect(containerElement.props().style.paddingTop).to.equal(19);
    expect(containerElement.props().style.marginBottom).to.equal(35);
    expect(containerElement.props().style.marginLeft).to.equal(undefined);

    const markdownElement = wrapper.find('EnhancedSafeMarkdown').first();
    expect(markdownElement.props().markdown).to.equal('md');
  });

  it('inTopPane has no top padding', function () {
    const wrapper = shallow(
      <MarkdownInstructions
        markdown="md"
        inTopPane={true}
        noInstructionsWhenCollapsed={true}
      />
    );
    const element = wrapper.find('.instructions-markdown').first();
    expect(element.props().style.paddingTop).to.equal(0);
  });
});
