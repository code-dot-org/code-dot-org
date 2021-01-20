import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedFindVocabularyDialog as FindVocabularyDialog} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindVocabularyDialog';
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
        {key: 'key1', word: 'word1', definition: 'definition1'},
        {key: 'key2', word: 'word2', definition: 'definition2'}
      ]
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    expect(wrapper.contains('Add Vocabulary')).to.be.true;
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('option').length).to.equal(2);
    expect(wrapper.find('Button').length).to.equal(1);
  });

  it('adds vocabulary key on confirm, no dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('key1');
  });

  it('adds vocabulary key on confirm, dropdown change', () => {
    const wrapper = shallow(<FindVocabularyDialog {...defaultProps} />);
    const select = wrapper.find('select').first();
    select.simulate('change', {target: {value: 'key2'}});
    const closeAndAddButton = wrapper.find('Button').first();
    closeAndAddButton.simulate('click', {preventDefault: () => {}});
    expect(handleConfirm).to.have.been.calledWith('key2');
  });
});
