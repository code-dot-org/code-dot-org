import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import MarkdownInstructions from '@cdo/apps/templates/instructions/MarkdownInstructions';

import {setExternalGlobals} from '../../../util/testUtils';

describe('MarkdownInstructions', function () {
  setExternalGlobals();

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
    expect(containerElement.props().style.paddingTop).toBe(19);
    expect(containerElement.props().style.marginBottom).toBe(35);
    expect(containerElement.props().style.marginLeft).toBeUndefined();

    const markdownElement = wrapper.find('EnhancedSafeMarkdown').first();
    expect(markdownElement.props().markdown).toBe('md');
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
    expect(element.props().style.paddingTop).toBe(0);
  });
});
