import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ImagePicker from '@cdo/apps/code-studio/components/ImagePicker';
import IconLibrary from '@cdo/apps/code-studio/components/IconLibrary';

describe('ImagePicker', () => {
  const defaultProps = {
    assetChosen: () => true,
    typeFilter: 'image',
    uploadsEnabled: false,
    showUnderageWarning: false,
    useFilesApi: false
  };
  it('shows two tabs by default', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    assert.equal(wrapper.find('#modeSwitch').length, 1);
  });
  it('shows icon picker when clicked', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    wrapper.find('p[children="Icons"]').simulate('click');
    console.log(wrapper.debug());
    assert.equal(wrapper.find(IconLibrary).length, 1);
  });
});
