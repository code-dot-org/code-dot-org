import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon';

import CreateNewLevelInputs from '@cdo/apps/lib/levelbuilder/lesson-editor/CreateNewLevelInputs';



describe('CreateNewLevelInputs', () => {
  let defaultProps, addLevel;
  beforeEach(() => {
    addLevel = sinon.spy();
    defaultProps = {
      levelOptions: [
        ['All Type', ''],
        ['Applab', 'Applab'],
        ['Dancelab', 'Dancelab'],
      ],
      addLevel,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.contains('Level Type:')).toBe(true);
    expect(wrapper.contains('Level Name:')).toBe(true);
    expect(wrapper.find('input').length).toBe(1);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('select').props().value).toBe('');
    expect(wrapper.find('button').length).toBe(1);
  });

  it('select level type', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('select').props().value).toBe('');
    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).toBe('Dancelab');
  });

  it('add level name', () => {
    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);
    expect(wrapper.find('input').length).toBe(1);
    expect(wrapper.find('input').props().value).toBe('');
    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).toBe('New Level');
  });

  it('click create level without type selected', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    expect(wrapper.find('select').props().value).toBe('');

    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).toBe('New Level');

    expect(wrapper.find('button').length).toBe(1);
    expect(wrapper.find('button').contains('Create and Add')).toBe(true);
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).not.toHaveBeenCalled();

    server.restore();
  });

  it('click create level without name input', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    expect(wrapper.find('input').props().value).toBe('');

    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).toBe('Dancelab');

    expect(wrapper.find('button').length).toBe(1);
    expect(wrapper.find('button').contains('Create and Add')).toBe(true);
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).not.toHaveBeenCalled();

    server.restore();
  });

  it('click create level with needed information', () => {
    let returnData = {id: 10, name: 'New Level Name'};
    let server = sinon.fakeServer.create();
    server.respondWith('POST', '/levels?do_not_redirect=true', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const wrapper = shallow(<CreateNewLevelInputs {...defaultProps} />);

    wrapper.find('input').simulate('change', {target: {value: 'New Level'}});
    expect(wrapper.find('input').props().value).toBe('New Level');

    wrapper.find('select').simulate('change', {target: {value: 'Dancelab'}});
    expect(wrapper.find('select').props().value).toBe('Dancelab');

    expect(wrapper.find('button').length).toBe(1);
    expect(wrapper.find('button').contains('Create and Add')).toBe(true);
    wrapper.find('button').simulate('click');

    server.respond();
    expect(addLevel).toHaveBeenCalledTimes(1);

    server.restore();
  });
});
