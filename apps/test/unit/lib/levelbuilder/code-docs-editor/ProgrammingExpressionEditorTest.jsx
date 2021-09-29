import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import sinon from 'sinon';

describe('ProgrammingExpressionEditor', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingExpression: {
        id: 1,
        name: 'Block',
        key: 'block',
        shortDescription: 'This is a short description.'
      }
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<ProgrammingExpressionEditor {...defaultProps} />);
    expect(wrapper.contains('Editing Block')).to.be.true;

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

  it('displays timestamp if save succeeds', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionEditor {...defaultProps} />
      </Provider>
    );

    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/programming_expressions/1`, [
      200,
      {'Content-Type': 'application/json'},
      ''
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

    server.respond();

    wrapper.update();
    expect(wrapper.find('SaveBar').props().lastSaved).to.not.be.null;
  });

  it('displays error message if save fails', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionEditor {...defaultProps} />
      </Provider>
    );

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/programming_expressions/1`, [
      404,
      {'Content-Type': 'application/json'},
      returnData
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);

    server.respond();

    wrapper.update();
    expect(wrapper.find('SaveBar').props().error).to.equal(
      'There was an error'
    );
  });
});
