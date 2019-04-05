import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

describe('GeneratedCode', () => {
  const wrapper = shallow(
    <GeneratedCode message="Test message" code="Test code" />
  );

  it('renders code explicitly in ltr', () => {
    expect(wrapper.containsMatchingElement(<pre dir="ltr">Test code</pre>)).to
      .be.ok;
  });

  it('renders message with markdown support', () => {
    expect(
      wrapper.containsMatchingElement(
        <UnsafeRenderedMarkdown markdown="Test message" />
      )
    ).to.be.ok;
  });
});
