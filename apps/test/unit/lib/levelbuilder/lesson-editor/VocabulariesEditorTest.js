import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedVocabulariesEditor as VocabulariesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/VocabulariesEditor';

describe('VocabulariesEditor', () => {
  let defaultProps, addVocabulary, updateVocabulary, removeVocabulary;
  beforeEach(() => {
    addVocabulary = jest.fn();
    updateVocabulary = jest.fn();
    removeVocabulary = jest.fn();
    defaultProps = {
      vocabularies: [
        {
          id: 1,
          key: '1',
          word: 'word1',
          definition: 'def1',
          commonSenseMedia: false,
        },
        {
          id: 2,
          key: '2',
          word: 'word2',
          definition: 'def2',
          commonSenseMedia: false,
        },
      ],
      addVocabulary,
      updateVocabulary,
      removeVocabulary,
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).toBe(3);
  });

  it('can remove a vocabulary', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-remove-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(2);
    deleteButton.simulate('click');
    expect(removeVocabulary).toHaveBeenCalledTimes(1);
  });

  it('can cancel removing a vocabulary', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-remove-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(1);
    cancelButton.simulate('click');
    expect(removeVocabulary).not.toHaveBeenCalled();
  });
});
