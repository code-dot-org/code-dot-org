/* eslint-disable react/no-danger */
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';

describe('GeneratedCode', () => {
  it('renders successfully', () => {
    const wrapper = shallow(
      <GeneratedCode message="Test message" code="Test code" />
    );
    expect(wrapper).to.containMatchingElement(
      <div className="generated-code-container">
        <div className="generatedCodeMessage">
          <p>Test message</p>
        </div>
        <pre className="generatedCode" dir="ltr">
          Test code
        </pre>
      </div>
    );
  });
});
