import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import FirebaseStorage from '@cdo/apps/storage/firebaseStorage';
import DatasetPicker from '@cdo/apps/code-studio/components/DatasetPicker';
import datasetLibrary from '@cdo/apps/code-studio/datasetLibrary.json';

describe('DatasetPicker', () => {
  const defaultProps = {
    assetChosen: () => true
  };

  it('shows one row per dataset', () => {
    const wrapper = mount(<DatasetPicker {...defaultProps} />);
    expect(wrapper.find('DatasetListEntry')).to.have.lengthOf(
      datasetLibrary.datasets.length
    );
  });

  it('calls Firebase on chooseAsset', () => {
    const wrapper = mount(<DatasetPicker {...defaultProps} />);
    var xhr = sinon.useFakeXMLHttpRequest();
    var requests = [];
    xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
    var createStub = sinon.stub(FirebaseStorage, 'createTable');
    var importStub = sinon.stub(FirebaseStorage, 'importCsv');

    wrapper.instance().chooseAsset('name', 'url');
    requests[0].respond(200);

    assert.isTrue(createStub.called);
    assert.isTrue(importStub.called);
    xhr.restore();
    createStub.restore();
    importStub.restore();
  });
});
