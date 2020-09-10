import {assert} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import ImagePicker from '@cdo/apps/code-studio/components/ImagePicker';
import IconLibrary from '@cdo/apps/code-studio/components/IconLibrary';
import AssetManager from '@cdo/apps/code-studio/components/AssetManager';
import ImageURLInput from '@cdo/apps/code-studio/components/ImageURLInput';

describe('ImagePicker', () => {
  const defaultProps = {
    assetChosen: () => true,
    typeFilter: 'image',
    uploadsEnabled: false,
    showUnderageWarning: false,
    useFilesApi: false
  };

  it('shows mode switch', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    assert.equal(wrapper.find('#modeSwitch').length, 1);
  });

  it('shows icons and files and links as options', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    const tabs = wrapper.find('#modeSwitch').find('span');

    assert.equal(tabs.length, 3);
    assert.equal(tabs.find('span[children="Icons"]').length, 1);
    assert.equal(tabs.find('span[children="My Files"]').length, 1);
    assert.equal(tabs.find('span[children="Link to Image"]').length, 1);
  });

  it('initially shows file picker by default', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    assert.equal(wrapper.find(AssetManager).length, 1);
  });

  it('shows icon picker when clicked', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    wrapper.find('span[children="Icons"]').simulate('click');
    assert.equal(wrapper.find(IconLibrary).length, 1);
  });

  it('shows url picker when clicked', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    wrapper.find('span[children="Link to Image"]').simulate('click');
    assert.equal(wrapper.find(ImageURLInput).length, 1);
  });
});
