/* eslint-disable react/no-danger */
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import GeneratedCode from '@cdo/apps/templates/feedback/GeneratedCode';

describe('GeneratedCode', () => {
  it('renders successfully', () => {
    const wrapper = shallow(
      <GeneratedCode
        message="Test message"
        code="Test code"
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div className="generated-code-container">
        <p
          className="generatedCodeMessage"
          dangerouslySetInnerHTML={{__html: 'Test message'}}
        />
        <pre
          className="generatedCode"
          dir="ltr"
          dangerouslySetInnerHTML={{__html: 'Test code'}}
        />
      </div>
    );
  });
});
