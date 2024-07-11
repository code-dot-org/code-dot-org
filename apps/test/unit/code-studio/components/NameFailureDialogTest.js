import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import NameFailureDialog from '@cdo/apps/code-studio/components/NameFailureDialog';

import {expect} from '../../../util/reconfiguredChai';

describe('NameFailureDialog', () => {
  it('renders with flagged text', () => {
    const wrapper = shallow(
      <NameFailureDialog
        flaggedText="farts"
        isOpen={true}
        handleClose={() => {}}
      />
    );
    expect(wrapper.find('h1').text()).to.include('Unable to rename project');
    expect(wrapper.find('p').text()).to.include('farts');
  });
});
