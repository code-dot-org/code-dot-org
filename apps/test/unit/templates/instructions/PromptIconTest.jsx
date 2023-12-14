import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import PromptIcon from '@cdo/apps/templates/instructions/PromptIcon';

const TEST_SRC_URL = 'example.jpg';

describe('PromptIcon', () => {
  it('renders like this', () => {
    const wrapper = shallow(<PromptIcon src={TEST_SRC_URL} />);
    expect(wrapper).to.containMatchingElement(
      // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
      // Verify or update this alt-text as necessary
      <img
        src={TEST_SRC_URL}
        id="prompt-icon"
        style={{
          maxWidth: 50,
          marginLeft: 5,
        }}
        alt=""
      />
    );
  });
});
