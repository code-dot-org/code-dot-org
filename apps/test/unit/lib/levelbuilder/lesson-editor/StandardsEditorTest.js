import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedStandardsEditor as StandardsEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/StandardsEditor';

const fakeStandards = [
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'AP',
    categoryDescription: 'Algorithms & Programming',
    shortcode: 'shortcode-1',
    description: 'Create programs that use variables to store and modify data.'
  },
  {
    frameworkShortcode: 'framework-1',
    frameworkName: 'Framework One',
    categoryShortcode: 'DA',
    categoryDescription: 'Data & Analysis',
    shortcode: 'shortcode-2',
    description: 'Translate between different bit representations of numbers.'
  }
];

describe('StandardsEditor', () => {
  let defaultProps, addStandard, removeStandard;
  beforeEach(() => {
    addStandard = sinon.spy();
    removeStandard = sinon.spy();
    defaultProps = {
      standardType: 'standard',
      standards: fakeStandards,
      frameworks: [],
      addStandard,
      removeStandard
    };
  });

  it('can remove a standard', () => {
    const wrapper = mount(<StandardsEditor {...defaultProps} />);
    const numStandards = wrapper.find('tr').length;
    expect(numStandards).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeStandardButton = wrapper
      .find('.unit-test-remove-standard')
      .first();
    removeStandardButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(1);
    deleteButton.simulate('click');
    expect(removeStandard).to.have.been.calledOnce;
  });

  it('can cancel removing a standard', () => {
    const wrapper = mount(<StandardsEditor {...defaultProps} />);
    const numStandards = wrapper.find('tr').length;
    expect(numStandards).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeStandardButton = wrapper
      .find('.unit-test-remove-standard')
      .first();
    removeStandardButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(0);
    cancelButton.simulate('click');
    expect(removeStandard).not.to.have.been.called;
  });
});
