import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
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
});
