import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import FindVocabularyDialog from '@cdo/apps/levelbuilder/lesson-editor/FindVocabularyDialog';

describe('FindVocabularyDialog', () => {
  let defaultProps, handleConfirm;
  beforeEach(() => {
    handleConfirm = jest.fn();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleClose: jest.fn(),
      vocabularies: [
        {
          id: 1,
          key: 'key1',
          markdownKey: 'key1/course/year',
          word: 'word1',
          definition: 'definition1',
          commonSenseMedia: true,
        },
        {
          id: 2,
          key: 'key2',
          markdownKey: 'key2/course/year',
          word: 'word2',
          definition: 'definition2',
          commonSenseMedia: true,
        },
      ],
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    expect(wrapper.contains('Add Vocabulary')).toBe(true);
    expect(wrapper.find('LessonEditorDialog').length).toBe(1);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('option').length).toBe(2);
    expect(wrapper.find('Button').length).toBe(1);
  });

  it('adds vocabulary key on confirm, no dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).toHaveBeenCalledWith('key1/course/year');
  });

  it('adds vocabulary key on confirm, dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const select = wrapper.find('select').first();
    select.simulate('change', {target: {value: 'key2/course/year'}});
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).toHaveBeenCalledWith('key2/course/year');
  });
});
