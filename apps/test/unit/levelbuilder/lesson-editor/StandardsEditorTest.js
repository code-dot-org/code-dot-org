import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStandardsEditor as StandardsEditor} from '@cdo/apps/levelbuilder/lesson-editor/StandardsEditor';

const fakeStandards = [
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'AP',
    categoryDescription: 'Algorithms & Programming',
    shortcode: 'shortcode-1',
    description: 'Create programs that use variables to store and modify data.',
  },
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'DA',
    categoryDescription: 'Data & Analysis',
    shortcode: 'shortcode-2',
    description: 'Translate between different bit representations of numbers.',
  },
];

describe('StandardsEditor', () => {
  let defaultProps, addStandard, removeStandard;
  beforeEach(() => {
    addStandard = jest.fn();
    removeStandard = jest.fn();
    defaultProps = {
      standardType: 'standard',
      standards: fakeStandards,
      frameworks: [],
      addStandard,
      removeStandard,
    };
  });

  it('can remove a standard', () => {
    const wrapper = mount(<StandardsEditor {...defaultProps} />);
    const numStandards = wrapper.find('tr').length;
    expect(numStandards).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeStandardButton = wrapper
      .find('.unit-test-remove-standard')
      .first();
    removeStandardButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(2);
    deleteButton.simulate('click');
    expect(removeStandard).toHaveBeenCalledTimes(1);
  });

  it('can cancel removing a standard', () => {
    const wrapper = mount(<StandardsEditor {...defaultProps} />);
    const numStandards = wrapper.find('tr').length;
    expect(numStandards).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeStandardButton = wrapper
      .find('.unit-test-remove-standard')
      .first();
    removeStandardButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(1);
    cancelButton.simulate('click');
    expect(removeStandard).not.toHaveBeenCalled();
  });
});
