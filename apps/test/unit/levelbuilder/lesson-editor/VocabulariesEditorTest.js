import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedVocabulariesEditor as VocabulariesEditor} from '@cdo/apps/levelbuilder/lesson-editor/VocabulariesEditor';

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

  it('opens the delete vocabulary dialog', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    expect(wrapper.find('Dialog').exists()).toBe(false);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-remove-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    expect(removeDialog.exists()).toBe(true);
    expect(removeDialog.text()).toEqual(
      expect.stringContaining('Delete Vocabulary')
    );
  });

  it('opens the add vocabulary dialog', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    expect(wrapper.find('BaseDialog').exists()).toBe(false);
    const addVocabularyButton = wrapper
      .find('.unit-test-add-vocabulary')
      .first();
    addVocabularyButton.simulate('click');
    const addDialog = wrapper.find('BaseDialog');
    expect(addDialog.exists()).toBe(true);
    expect(addDialog.text()).toEqual(expect.stringContaining('Add Vocabulary'));
  });
});
