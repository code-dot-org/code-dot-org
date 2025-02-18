import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('GeneratedCode', () => {
  const wrapper = shallow(
    <GeneratedCode message="Test message" code="Test code" />
  );

  it('renders code explicitly in ltr', () => {
    expect(wrapper).to.containMatchingElement(<pre dir="ltr">Test code</pre>);
  });

  it('renders message with markdown support', () => {
    expect(wrapper).to.containMatchingElement(
      <SafeMarkdown markdown="Test message" />
    );
  });
});
