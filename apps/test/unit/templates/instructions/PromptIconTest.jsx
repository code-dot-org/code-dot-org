import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import PromptIcon from '@cdo/apps/templates/instructions/PromptIcon';

const TEST_SRC_URL = 'example.jpg';

describe('PromptIcon', () => {
  it('renders like this', () => {
    const wrapper = shallow(<PromptIcon src={TEST_SRC_URL} />);
    expect(
      wrapper.containsMatchingElement(
        <img
          src={TEST_SRC_URL}
          id="prompt-icon"
          style={{
            maxWidth: 50
          }}
        />
      )
    ).to.be.ok;
  });
});
