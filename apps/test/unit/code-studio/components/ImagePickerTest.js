import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AssetManager from '@cdo/apps/code-studio/components/AssetManager';
import IconLibrary from '@cdo/apps/code-studio/components/IconLibrary';
import ImagePicker from '@cdo/apps/code-studio/components/ImagePicker';
import ImageURLInput from '@cdo/apps/code-studio/components/ImageURLInput';
import {stubRedux, registerReducers} from '@cdo/apps/redux';
import * as commonReducers from '@cdo/apps/redux/commonReducers';

describe('ImagePicker', () => {
  const defaultProps = {
    assetChosen: () => true,
    typeFilter: 'image',
    uploadsEnabled: false,
    showUnderageWarning: false,
    useFilesApi: false,
  };

  beforeAll(() => {
    stubRedux();
    registerReducers(commonReducers);
  });

  it('shows mode switch', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    expect(wrapper.find('#modeSwitch').length).toEqual(1);
  });

  it('shows icons and files and links as options', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    const tabs = wrapper.find('#modeSwitch').find('span');

    expect(tabs.length).toEqual(3);
    expect(tabs.find('span[children="Icons"]').length).toEqual(1);
    expect(tabs.find('span[children="My Files"]').length).toEqual(1);
    expect(tabs.find('span[children="Link to Image"]').length).toEqual(1);
  });

  it('initially shows file picker by default', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    expect(wrapper.find(AssetManager).length).toEqual(1);
  });

  it('shows icon picker when clicked', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    wrapper.find('span[children="Icons"]').simulate('click');
    expect(wrapper.find(IconLibrary).length).toEqual(1);
  });

  it('shows url picker when clicked', () => {
    const wrapper = shallow(<ImagePicker {...defaultProps} />);
    wrapper.find('span[children="Link to Image"]').simulate('click');
    expect(wrapper.find(ImageURLInput).length).toEqual(1);
  });
});
