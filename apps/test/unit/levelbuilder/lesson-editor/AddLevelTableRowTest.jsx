import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import AddLevelTableRow from '@cdo/apps/levelbuilder/lesson-editor/AddLevelTableRow';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AddLevelTableRow', () => {
  let defaultProps, addLevel;
  beforeEach(() => {
    addLevel = sinon.spy();
    defaultProps = {
      addLevel,
      isInLesson: false,
      level: {
        id: 1,
        name: 'Level 1',
        type: 'Applab',
        owner: 'Islay',
        updated_at: '09/30/20 at 08:37:04 PM',
      },
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelTableRow {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(2);
    expect(wrapper.find('tr').length).to.equal(1);
  });

  it('add level', () => {
    const wrapper = shallow(<AddLevelTableRow {...defaultProps} />);

    const addButton = wrapper.find('button').at(0);
    addButton.simulate('click');
    expect(addLevel).to.have.been.calledWith(defaultProps.level);
  });

  it('add and clone level', () => {
    const prompt = sinon.stub(window, 'prompt');
    prompt.returns('NewLevelName');

    let returnData = {id: 11, name: 'NewLevelName'};
    let server = sinon.fakeServer.create();
    server.respondWith(
      'POST',
      `/levels/1/clone?name=NewLevelName&do_not_redirect=true`,
      [200, {'Content-Type': 'application/json'}, JSON.stringify(returnData)]
    );

    const wrapper = shallow(<AddLevelTableRow {...defaultProps} />);

    const addAndCloneButton = wrapper.find('button').at(1);
    addAndCloneButton.simulate('click');

    server.respond();
    expect(addLevel).to.have.been.calledOnce;

    window.prompt.restore();
    server.restore();
  });
});
