import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ImageInput from '@cdo/apps/lib/levelbuilder/ImageInput';



describe('ImageInput', () => {
  it('displays image upload dialog when upload image button is pressed', () => {
    const wrapper = shallow(<ImageInput updateImageUrl={() => {}} />);
    const uploadButton = wrapper.find('Button').first();
    expect(uploadButton).not.toBeNull();
    uploadButton.simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('UploadImageDialog').length).toBe(1);
  });

  it('uses initialImageUrl if one is provided', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        initialImageUrl="code.org/images/spritelab.png"
      />
    );
    expect(wrapper.find('input').first().props().value).toBe('code.org/images/spritelab.png');
  });

  it('calls callback after image is updated', () => {
    const updateImageUrlSpy = jest.fn();
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={updateImageUrlSpy}
        initialImageUrl="code.org/images/spritelab.png"
      />
    );
    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {value: 'code.org/images/applab.png'}});
    wrapper.update();
    expect(updateImageUrlSpy).toHaveBeenCalled().once;
  });

  it('shows preview is showPreview is true', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        initialImageUrl="code.org/images/spritelab.png"
        showPreview
      />
    );
    expect(wrapper.find('img').length).toBe(1);
    expect(wrapper.find('img').props().src).toBe('code.org/images/spritelab.png');
  });

  it('shows HelpTip if text is passed in for it', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        initialImageUrl="code.org/images/spritelab.png"
        showPreview
        helpTipText="Sample help tip text."
      />
    );
    expect(wrapper.find('HelpTip').length).toBe(1);
    expect(wrapper.find('HelpTip').props().children.props.children).toBe('Sample help tip text.');
  });
});
