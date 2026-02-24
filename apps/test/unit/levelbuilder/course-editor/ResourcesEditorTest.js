import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ResourcesEditor from '@cdo/apps/levelbuilder/course-editor/ResourcesEditor';

describe('ResourcesEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      inputStyle: {},
    };
  });

  it('uses the new resource editor for resources', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[
          {
            id: 1,
            key: 'curriculum',
            name: 'Curriculum',
            url: 'https://example.com/a',
          },
          {
            id: 2,
            key: 'vocabulary',
            name: 'Vocabulary',
            url: 'https://example.com/b',
          },
        ]}
        courseVersionId={1}
      />
    );
    expect(wrapper.find('Connect(ResourcesEditor)').length).toBe(1);
  });

  it('uses no editor for resources without courseVersionId', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[
          {
            id: 1,
            key: 'curriculum',
            name: 'Curriculum',
            url: 'https://example.com/a',
          },
          {
            id: 2,
            key: 'vocabulary',
            name: 'Vocabulary',
            url: 'https://example.com/b',
          },
        ]}
        courseVersionId={null}
      />
    );
    expect(wrapper.find('Connect(ResourcesEditor)').length).toBe(0);
    expect(
      wrapper.contains(
        'Cannot add resources to migrated script without course version.'
      )
    );
  });
});
