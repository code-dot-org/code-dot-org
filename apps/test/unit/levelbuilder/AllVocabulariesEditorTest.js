import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedAllVocabulariesEditor as AllVocabulariesEditor} from '@cdo/apps/levelbuilder/AllVocabulariesEditor';

describe('AllVocabulariesEditor', () => {
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
      courseVersionId: 2021,
      courseName: 'test-course-2021',
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<AllVocabulariesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).toBe(3);
  });

  it('can remove a vocabulary', () => {
    const wrapper = mount(<AllVocabulariesEditor {...defaultProps} />);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).toBeGreaterThanOrEqual(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-destroy-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(2);
    deleteButton.simulate('click');
    expect(removeVocabulary).toHaveBeenCalledTimes(1);
  });

  it('can add a vocabulary', () => {
    const wrapper = mount(<AllVocabulariesEditor {...defaultProps} />);
    const addVocabularyButton = wrapper.find('a');
    expect(addVocabularyButton.contains('Create New Vocabulary')).toBe(true);
    addVocabularyButton.simulate('click');
    expect(wrapper.find('AddVocabularyDialog').length).toBe(1);
  });
});
