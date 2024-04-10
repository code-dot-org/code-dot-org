import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import NameFailureDialog from '@cdo/apps/code-studio/components/NameFailureDialog';

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
