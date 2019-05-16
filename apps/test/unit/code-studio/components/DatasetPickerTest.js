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
    var importDatasetStub = sinon.stub(FirebaseStorage, 'importDataset');

    wrapper.instance().chooseAsset('name', 'url');

    assert.isTrue(importDatasetStub.called);
    importDatasetStub.restore();
  });
});
