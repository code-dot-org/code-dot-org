import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import AssetRow from '@cdo/apps/code-studio/components/AssetRow';

describe('AssetRow', () => {
  it('recognizes assets with an apostrophe in the src string', () => {
    var visualization = document.createElement('div');
    visualization.id = 'visualization';
    var child = document.createElement('div');
    child.setAttribute('src', "foo's.bar");
    visualization.appendChild(child);
    document.body.appendChild(visualization);
    const wrapper = mount(
      <table>
        <tbody>
          <AssetRow
            name="foo's.bar"
            type="image"
            useFilesApi={false}
            onDelete={() => {}}
          />
        </tbody>
      </table>
    );

    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('button.btn-danger')).to.have.lengthOf(0);
  });
});
