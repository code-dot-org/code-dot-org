import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import FindVocabularyDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/FindVocabularyDialog';
import sinon from 'sinon';

describe('FindVocabularyDialog', () => {
  let defaultProps, handleConfirm;
  beforeEach(() => {
    handleConfirm = sinon.spy();
    defaultProps = {
      isOpen: true,
      handleConfirm,
      handleClose: sinon.spy(),
      vocabularies: [
        {
          id: 1,
          key: 'key1',
          markdownKey: 'key1/course/year',
          word: 'word1',
          definition: 'definition1',
          commonSenseMedia: true
        },
        {
          id: 2,
          key: 'key2',
          markdownKey: 'key2/course/year',
          word: 'word2',
          definition: 'definition2',
          commonSenseMedia: true
        }
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    expect(wrapper.contains('Add Vocabulary')).to.be.true;
    expect(wrapper.find('LessonEditorDialog').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('option').length).to.equal(2);
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('adds vocabulary key on confirm, no dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('key1/course/year');
  });

  it('adds vocabulary key on confirm, dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const select = wrapper.find('select').first();
    select.simulate('change', {target: {value: 'key2/course/year'}});
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('key2/course/year');
  });
});
