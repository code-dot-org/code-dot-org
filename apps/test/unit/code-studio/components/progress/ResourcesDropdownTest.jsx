import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import i18n from '@cdo/locale';

const SAMPLE_RESOURCES = [
  {key: 'key1', name: 'Curriculum', url: 'https://example.com/a'},
  {key: 'key2', name: 'Vocabulary', url: 'https://example.com/b'},
];

describe('ResourcesDropdown', () => {
  it('renders resources for teacher', () => {
    const wrapper = shallow(<ResourcesDropdown resources={SAMPLE_RESOURCES} />);
    const dropdown = wrapper.find(ActionDropdown);
    expect(dropdown.length).toBe(1);
    expect(dropdown.prop('labelText')).toEqual(i18n.teacherResources());
    expect(dropdown.prop('options').map(o => o.label)).toEqual([
      'Curriculum',
      'Vocabulary',
    ]);
    // trigger uses neutral tertiary styling for both audiences
    expect(dropdown.prop('triggerButtonProps').color).toEqual('tertiary');
    expect(dropdown.prop('size')).toEqual('s');
  });

  it('renders resources for student', () => {
    const wrapper = shallow(
      <ResourcesDropdown resources={SAMPLE_RESOURCES} studentFacing={true} />
    );
    const dropdown = wrapper.find(ActionDropdown);
    expect(dropdown.length).toBe(1);
    expect(dropdown.prop('labelText')).toEqual(i18n.studentResources());
    expect(dropdown.prop('options').map(o => o.label)).toEqual([
      'Curriculum',
      'Vocabulary',
    ]);
    expect(dropdown.prop('triggerButtonProps').color).toEqual('tertiary');
    expect(dropdown.prop('size')).toEqual('s');
  });
});
