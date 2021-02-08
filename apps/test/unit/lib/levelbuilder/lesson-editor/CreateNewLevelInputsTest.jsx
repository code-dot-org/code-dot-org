import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';
import sinon from 'sinon';

describe('CreateNewLevelInputs', () => {
  let defaultProps, addLevel;
  beforeEach(() => {
    addLevel = sinon.spy();
    defaultProps = {
      levelOptions: [
        ['All Type', ''],
        ['Applab', 'Applab'],
        ['Dancelab', 'Dancelab']
      ],
      addLevel
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.contains('Level Type:')).to.be.true;
    expect(wrapper.contains('Level Name:')).to.be.true;
    expect(wrapper.find('input').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('select').props().value).to.equal('');
    expect(wrapper.find('button').length).to.equal(1);
  });

  it('select level type', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('select').props().value).to.equal('');
    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).to.equal('Dancelab');
  });

  it('add level name', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.find('input').length).to.equal(1);
    expect(wrapper.find('input').props().value).to.equal('');
    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).to.equal('New Level');
  });

  it('click create level without type selected', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    expect(wrapper.find('select').props().value).to.equal('');

    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).to.equal('New Level');

    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.find('button').contains('Create and Add')).to.be.true;
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).not.to.have.been.called;

    server.restore();
  });

  it('click create level without name input', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    expect(wrapper.find('input').props().value).to.equal('');

    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).to.equal('Dancelab');

    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.find('button').contains('Create and Add')).to.be.true;
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).not.to.have.been.called;

    server.restore();
  });

  it('click create level with needed information', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).to.equal('New Level');

    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).to.equal('Dancelab');

    expect(wrapper.find('button').length).to.equal(1);
    expect(wrapper.find('button').contains('Create and Add')).to.be.true;
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).to.have.been.calledOnce;

    server.restore();
  });
});
