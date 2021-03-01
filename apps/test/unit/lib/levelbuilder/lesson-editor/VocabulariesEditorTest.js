import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedVocabulariesEditor as VocabulariesEditor} from '@cdo/apps/lib/levelbuilder/lesson-editor/VocabulariesEditor';

describe('VocabulariesEditor', () => {
  let defaultProps, addVocabulary, updateVocabulary, removeVocabulary;
  beforeEach(() => {
    addVocabulary = sinon.spy();
    updateVocabulary = sinon.spy();
    removeVocabulary = sinon.spy();
    defaultProps = {
      vocabularies: [
        {
          id: 1,
          key: '1',
          word: 'word1',
          definition: 'def1',
          commonSenseMedia: false
        },
        {
          id: 2,
          key: '2',
          word: 'word2',
          definition: 'def2',
          commonSenseMedia: false
        }
      ],
      addVocabulary,
      updateVocabulary,
      removeVocabulary
    };
  });

  it('renders default props', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    expect(wrapper.find('tr').length).to.equal(3);
  });

  it('can remove a vocabulary', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-remove-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const deleteButton = removeDialog.find('button').at(1);
    deleteButton.simulate('click');
    expect(removeVocabulary).to.have.been.calledOnce;
  });

  it('can cancel removing a vocabulary', () => {
    const wrapper = mount(<VocabulariesEditor {...defaultProps} />);
    const numVocabularies = wrapper.find('tr').length;
    expect(numVocabularies).at.least(2);
    // Find one of the "remove" buttons and click it
    const removeVocabularyButton = wrapper
      .find('.unit-test-remove-vocabulary')
      .first();
    removeVocabularyButton.simulate('mouseDown');
    const removeDialog = wrapper.find('Dialog');
    const cancelButton = removeDialog.find('button').at(0);
    cancelButton.simulate('click');
    expect(removeVocabulary).not.to.have.been.called;
  });
});
