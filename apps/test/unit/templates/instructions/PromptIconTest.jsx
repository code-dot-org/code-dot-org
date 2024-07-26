import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import PromptIcon from '@cdo/apps/templates/instructions/PromptIcon';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const TEST_SRC_URL = 'example.jpg';

describe('PromptIcon', () => {
  it('renders like this', () => {
    const wrapper = shallow(<PromptIcon src={TEST_SRC_URL} />);
    expect(wrapper).to.containMatchingElement(
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
