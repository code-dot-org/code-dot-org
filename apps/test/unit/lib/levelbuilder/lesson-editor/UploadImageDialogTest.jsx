import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';

import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';

import {expect} from '../../../../util/reconfiguredChai';

describe('UploadImageDialog', () => {
  it('uploads selected image', () => {
    const wrapper = shallow(
      <UploadImageDialog
        isOpen={true}
        handleClose={() => {}}
        uploadImage={() => {}}
      />
    );

    const fetchStub = sinon.stub(window, 'fetch').resolves();
    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {files: ['filedata']}});

    expect(fetchStub.callCount).to.equal(1);

    const fetchCall = fetchStub.getCall(0);
    expect(fetchCall.args[0]).to.equal('/level_assets/upload');
    expect(fetchCall.args[1].body.get('file')).to.equal('filedata');

    fetchStub.restore();
  });

  it('returns the uploaded image url', () => {
    const handleClose = sinon.fake();
    const uploadImage = sinon.fake();
    const wrapper = shallow(
      <UploadImageDialog
        isOpen={true}
        handleClose={handleClose}
        uploadImage={uploadImage}
      />
    );
    const returnData = {newAssetUrl: 'http://example.com/img.png'};
    const fetchStub = sinon
      .stub(window, 'fetch')
      .returns(Promise.resolve({ok: true, json: () => returnData}));

    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {files: ['filedata']}});
    expect(handleClose.callCount).to.equal(0);
    expect(uploadImage.callCount).to.equal(0);

    return new Promise(resolve => setImmediate(resolve)).then(() => {
      wrapper
        .find('Button')
        .last()
        .simulate('click');
      expect(handleClose.callCount).to.equal(1);
      expect(uploadImage.callCount).to.equal(1);
      expect(uploadImage.calledWith('http://example.com/img.png')).to.be.true;
      fetchStub.restore();
    });
  });
});
