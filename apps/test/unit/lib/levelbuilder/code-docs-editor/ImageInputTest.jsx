import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ImageInput from '@cdo/apps/lib/levelbuilder/code-docs-editor/ImageInput';

describe('ImageInput', () => {
  it('displays image upload dialog when upload image button is pressed', () => {
    const wrapper = shallow(<ImageInput updateImageUrl={() => {}} />);
    const uploadButton = wrapper.find('Button').first();
    expect(uploadButton).to.not.be.null;
    uploadButton.simulate('click');
    expect(wrapper.find('UploadImageDialog').length).to.equal(1);
  });

  it('shows imageUrl if one is provided', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        imageUrl="code.org/images/spritelab.png"
      />
    );
    expect(wrapper.text().includes('code.org/images/spritelab.png')).to.be.true;
  });

  it('shows confirmation dialog if remove image button is pressed', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        imageUrl="code.org/images/spritelab.png"
      />
    );
    expect(wrapper.find('Button').length).to.equal(2);
    const removeButton = wrapper.find('Button').last();
    removeButton.simulate('click');
    expect(wrapper.find('StylizedBaseDialog').length).to.equal(1);
  });
});
