import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedMarkdownInstructions} from '@cdo/apps/templates/instructions/MarkdownInstructions';

import {setExternalGlobals} from '../../../util/testUtils';

describe('MarkdownInstructions', function () {
  setExternalGlobals();

  const defaultProps = {
    openImageDialog: () => {},
  };

  it('standard case had top padding and no left margin', function () {
    const wrapper = shallow(
      <UnconnectedMarkdownInstructions
        {...defaultProps}
        markdown="md"
        markdownClassicMargins={false}
        inTopPane={false}
        noInstructionsWhenCollapsed={true}
      />
    );

    const containerElement = wrapper.find('.instructions-markdown').first();
    expect(containerElement.props().style.paddingTop).toBe(19);
    expect(containerElement.props().style.marginBottom).toBe(35);
    expect(containerElement.props().style.marginLeft).toBeUndefined();

    const markdownElement = wrapper.find('EnhancedSafeMarkdown').first();
    expect(markdownElement.props().markdown).toBe('md');
  });

  it('inTopPane has no top padding', function () {
    const wrapper = shallow(
      <UnconnectedMarkdownInstructions
        {...defaultProps}
        markdown="md"
        inTopPane={true}
        noInstructionsWhenCollapsed={true}
      />
    );
    const element = wrapper.find('.instructions-markdown').first();
    expect(element.props().style.paddingTop).toBe(0);
  });

  it('renders EnhancedSafeMarkdown for non-blockly content', function () {
    const wrapper = shallow(
      <UnconnectedMarkdownInstructions {...defaultProps} markdown="md" />
    );
    expect(wrapper.find('EnhancedSafeMarkdown').exists()).toBe(true);
    expect(wrapper.find('BlocklyMarkdown').exists()).toBe(false);
  });

  it('renders BlocklyMarkdown for blockly content', function () {
    const wrapper = shallow(
      <UnconnectedMarkdownInstructions
        {...defaultProps}
        markdown="md"
        isBlockly
      />
    );
    const blocklyMarkdown = wrapper.find('BlocklyMarkdown').first();
    expect(blocklyMarkdown.exists()).toBe(true);
    expect(blocklyMarkdown.props().content).toBe('md');
    expect(wrapper.find('EnhancedSafeMarkdown').exists()).toBe(false);
  });
});
