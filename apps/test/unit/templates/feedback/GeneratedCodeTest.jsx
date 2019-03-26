import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

describe('GeneratedCode', () => {
  const wrapper = shallow(
    <GeneratedCode message="Test message" code="Test code" />
  );

  it('renders code explicitly in ltr', () => {
    expect(wrapper).to.containMatchingElement(<pre dir="ltr">Test code</pre>);
  });

  it('renders message with markdown support', () => {
    expect(wrapper).to.containMatchingElement(
      <UnsafeRenderedMarkdown markdown="Test message" />
    );
  });
});
