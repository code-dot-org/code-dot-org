import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';



describe('UploadImageDialog', () => {
  it('uploads selected image', () => {
    const wrapper = shallow(
      <UploadImageDialog
        isOpen={true}
        handleClose={() => {}}
        uploadImage={() => {}}
      />
    );

    const fetchStub = jest.spyOn(window, 'fetch').mockClear().mockImplementation().resolves();
    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {files: ['filedata']}});

    expect(fetchStub).toHaveBeenCalledTimes(1);

    const fetchCall = fetchStub.mock.calls[0];
    expect(fetchCall.mock.calls[0]).toBe('/level_assets/upload');
    expect(fetchCall.mock.calls[1].body.get('file')).toBe('filedata');

    fetchStub.mockRestore();
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
    const fetchStub = jest.spyOn(window, 'fetch').mockClear()
      .mockReturnValue(Promise.resolve({ok: true, json: () => returnData}));

    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {files: ['filedata']}});
    expect(wrapper.find('input').first().props().disabled).toBe(true);
    expect(wrapper.find('Button').last().props().disabled).toBe(true);
    expect(wrapper.find('FontAwesome').length).toBe(1);

    expect(handleClose).toHaveBeenCalledTimes(0);
    expect(uploadImage).toHaveBeenCalledTimes(0);

    return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
      wrapper.find('Button').last().simulate('click');
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(uploadImage).toHaveBeenCalledTimes(1);
      expect(uploadImage).toHaveBeenCalledWith('http://example.com/img.png');
      fetchStub.mockRestore();
    });
  });

  it('doesnt try to upload undefined image', () => {
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
    const fetchStub = jest.spyOn(window, 'fetch').mockClear()
      .mockReturnValue(Promise.resolve({ok: true, json: () => returnData}));

    wrapper
      .find('input')
      .first()
      .simulate('change', {target: {files: ['filedata']}});
    expect(wrapper.find('input').first().props().disabled).toBe(true);
    expect(wrapper.find('Button').last().props().disabled).toBe(true);
    expect(wrapper.find('FontAwesome').length).toBe(1);

    return new Promise(resolve => setTimeout(resolve, 0)).then(() => {
      wrapper
        .find('input')
        .first()
        .simulate('change', {target: {files: []}});
      expect(fetchStub).toHaveBeenCalledTimes(1);
      fetchStub.mockRestore();
    });
  });
});
