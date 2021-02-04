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
    expect(
      wrapper
        .find('input')
        .first()
        .props().disabled
    ).to.be.false;
  });

  it('closes if save is successful', () => {
    const wrapper = mount(<AddVocabularyDialog {...defaultProps} />);
    const instance = wrapper.instance();
    instance.setState({
      word: 'my vocabulary word',
      definition: 'my vocabulary definition'
    });
    instance.forceUpdate();
    wrapper.update();
    /*const saveVocabularySpy = sinon.stub(instance, 'saveVocabulary');
    expect(saveVocabularySpy.calledOnce).to.be.true;*/
    let returnData = {
      id: 1,
      key: 'my vocabulary word',
      word: 'my vocabulary word',
      definition: 'my vocabulary definition'
    };
    let server = sinon.fakeServer.create();
    server.respondWith('POST', `/vocabularies`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    wrapper.find('#submit-button').simulate('click');
    expect(wrapper.find('AddVocabularyDialog').state().isSaving).to.be.true;

    server.respond();
    wrapper.update();

    expect(handleCloseSpy.calledOnce).to.be.true;
    expect(afterSaveSpy.calledOnce).to.be.true;
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
    expect(wrapper.find('[name="word"]').props().disabled).to.be.true;
    expect(wrapper.find('[name="definition"]').props().value).to.equal(
      'existing definition'
    );
  });

  it('shows an error if save was unsuccessful', () => {
    const wrapper = mount(<AddVocabularyDialog {...defaultProps} />);
    const instance = wrapper.instance();
    instance.setState({
      word: 'my vocabulary word',
      definition: 'my vocabulary definition'
    });
    instance.forceUpdate();
    wrapper.update();

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('POST', `/vocabularies`, [
      404,
      {'Content-Type': 'application/json'},
      returnData
    ]);

    wrapper.find('#submit-button').simulate('click');
    server.respond();
    wrapper.update();
    expect(wrapper.find('h3').contains('There was an error'));
  });
});
