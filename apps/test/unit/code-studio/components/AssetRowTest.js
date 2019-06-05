import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import AssetRow from '@cdo/apps/code-studio/components/AssetRow';

describe('AssetRow', () => {
  it('recognizes assets with an apostrophe in the src string', () => {
    document.write(`<div id="visualization"><div src="foo's.bar" /></div>`);
    const wrapper = shallow(
      <AssetRow
        name="foo's.bar"
        type="image"
        useFilesApi={false}
        onDelete={() => {}}
      />
    );

    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('button.btn-danger')).to.have.lengthOf(0);
  });
});
