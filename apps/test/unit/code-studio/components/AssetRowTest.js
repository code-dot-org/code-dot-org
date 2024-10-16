import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AssetRow from '@cdo/apps/code-studio/components/AssetRow';

const DEFAULT_PROPS = {
  name: `fo\'o's.bar`,
  type: 'image',
  api: {
    basePath: name => `/path/to/${name}`,
  },
  onDelete: () => {},
};

describe('AssetRow', () => {
  it('recognizes assets with apostrophes and escaped apostrophes in the src string', () => {
    var visualization = document.createElement('div');
    visualization.id = 'visualization';
    var child = document.createElement('div');
    child.setAttribute('src', `fo\'o's.bar`);
    visualization.appendChild(child);
    document.body.appendChild(visualization);
    const wrapper = mount(
      <table>
        <tbody>
          <AssetRow {...DEFAULT_PROPS} useFilesApi={false} />
        </tbody>
      </table>
    );

    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('button.btn-danger')).toHaveLength(0);
  });

  describe('hideDelete', () => {
    it('displays the delete button for normal action if hideDelete is false', () => {
      const wrapper = mount(
        <table>
          <tbody>
            <AssetRow {...DEFAULT_PROPS} hideDelete={false} />
          </tbody>
        </table>
      );

      expect(wrapper.find('i.fa.fa-trash-o')).toHaveLength(1);
    });

    it('does not display the delete button for normal action if hideDelete is true', () => {
      const wrapper = mount(
        <table>
          <tbody>
            <AssetRow {...DEFAULT_PROPS} hideDelete={true} />
          </tbody>
        </table>
      );

      expect(wrapper.find('i.fa.fa-trash-o')).toHaveLength(0);
    });
  });
});
