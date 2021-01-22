import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddVocabularyDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddVocabularyDialog';
import sinon from 'sinon';

describe('AddVocabularyDialog', () => {
  let defaultProps, afterSaveSpy, handleCloseSpy;
  beforeEach(() => {
    afterSaveSpy = sinon.spy();
    handleCloseSpy = sinon.spy();
    defaultProps = {
      isOpen: true,
      afterSave: afterSaveSpy,
      handleClose: handleCloseSpy,
      courseVersionId: 1
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddVocabularyDialog {...defaultProps} />);
    expect(wrapper.contains('Add Vocabulary')).to.be.true;
    expect(wrapper.find('input').length).to.equal(2);
  });

  it('saves if input is valid', () => {
    const wrapper = mount(<AddVocabularyDialog {...defaultProps} />);
    const instance = wrapper.instance();
    instance.setState({
      word: 'my vocabulary word',
      definition: 'my vocabulary definition'
    });
    const saveVocabularySpy = sinon.stub(instance, 'saveVocabulary');
    instance.forceUpdate();
    wrapper.update();
    wrapper.find('#submit-button').simulate('click');
    expect(saveVocabularySpy.calledOnce).to.be.true;
  });

  it('renders an existing vocabulary for edit', () => {
    const existingVocabulary = {
      id: 200,
      key: 'key',
      word: 'existing vocab',
      definition: 'existing definition'
    };
    const wrapper = mount(
      <AddVocabularyDialog
        {...defaultProps}
        editingVocabulary={existingVocabulary}
      />
    );
    expect(wrapper.find('[name="word"]').props().value).to.equal(
      'existing vocab'
    );
    expect(wrapper.find('[name="definition"]').props().value).to.equal(
      'existing definition'
    );
  });
});
