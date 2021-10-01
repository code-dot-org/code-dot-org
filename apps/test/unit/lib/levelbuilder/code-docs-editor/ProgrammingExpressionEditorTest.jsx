import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import sinon from 'sinon';

describe('ProgrammingExpressionEditor', () => {
  let defaultProps, fetchSpy;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingExpression: {
        id: 1,
        name: 'Block',
        key: 'block',
        shortDescription: 'This is a short description.'
      }
    };
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('renders default props', () => {
    const wrapper = shallow(<ProgrammingExpressionEditor {...defaultProps} />);
    expect(wrapper.contains('Editing block')).to.be.true;

    // Display name
    expect(
      wrapper
        .find('input')
        .at(0)
        .props().value
    ).to.equal('Block');

    // Key
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().value
    ).to.equal('block');
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().readOnly
    ).to.be.true;

    // short description
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(1);
    expect(
      wrapper.find('TextareaWithMarkdownPreview').props().markdown
    ).to.equal('This is a short description.');
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.returns(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).to.be.called.once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).to.equal('/programming_expressions/1');
  });
});
