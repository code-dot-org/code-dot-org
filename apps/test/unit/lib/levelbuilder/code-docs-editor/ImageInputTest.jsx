import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import ImageInput from '@cdo/apps/lib/levelbuilder/code-docs-editor/ImageInput';

describe('ImageInput', () => {
  it('displays image upload dialog when upload image button is pressed', () => {
    const wrapper = shallow(<ImageInput updateImageUrl={() => {}} />);
    const uploadButton = wrapper.find('Button').first();
    expect(uploadButton).to.not.be.null;
    uploadButton.simulate('click', {preventDefault: () => {}});
    expect(wrapper.find('UploadImageDialog').length).to.equal(1);
  });

  it('uses initialImageUrl if one is provided', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        initialImageUrl="code.org/images/spritelab.png"
      />
    );
    expect(
      wrapper
        .find('input')
        .first()
        .props().value
    ).to.equal('code.org/images/spritelab.png');
  });

  it('calls callback after image is updated', () => {
    const updateImageUrlSpy = sinon.spy();
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
    expect(updateImageUrlSpy).to.be.called.once;
  });

  it('shows preview is showPreview is true', () => {
    const wrapper = shallow(
      <ImageInput
        updateImageUrl={() => {}}
        initialImageUrl="code.org/images/spritelab.png"
        showPreview
      />
    );
    expect(wrapper.find('img').length).to.equal(1);
    expect(wrapper.find('img').props().src).to.equal(
      'code.org/images/spritelab.png'
    );
  });
});
