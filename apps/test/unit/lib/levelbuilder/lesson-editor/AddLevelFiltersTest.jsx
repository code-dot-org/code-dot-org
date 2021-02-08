import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedAddLevelFilters as AddLevelFilters} from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';
import sinon from 'sinon';
import {searchOptions} from './activitiesTestData';

describe('AddLevelFilters', () => {
  let defaultProps,
    handleSearch,
    handleChangeLevelName,
    handleChangeLevelType,
    handleChangeScript,
    handleChangeOwner;
  beforeEach(() => {
    handleSearch = sinon.spy();
    handleChangeLevelName = sinon.spy();
    handleChangeLevelType = sinon.spy();
    handleChangeScript = sinon.spy();
    handleChangeOwner = sinon.spy();
    defaultProps = {
      searchOptions: searchOptions,
      handleSearch,
      handleChangeLevelName,
      handleChangeLevelType,
      handleChangeScript,
      handleChangeOwner,
      ownerId: '',
      scriptId: '',
      levelType: '',
      levelName: ''
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddLevelFilters {...defaultProps} />);
    expect(wrapper.contains('By Name:')).to.be.true;
    expect(wrapper.contains('By Type:')).to.be.true;
    expect(wrapper.contains('By Script:')).to.be.true;
    expect(wrapper.contains('By Owner:')).to.be.true;
    expect(wrapper.find('input').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(3);
    expect(wrapper.find('button').length).to.equal(1);
  });

  it('change values for search', () => {
    const wrapper = shallow(<AddLevelFilters {...defaultProps} />);

    const input = wrapper.find('input');
    expect(input.props().value).to.include('');
    input.simulate('change', {
      target: {value: 'Level Name'}
    });
    expect(handleChangeLevelName).to.have.been.calledOnce;

    const levelTypeDropdown = wrapper.find('select').at(0);
    expect(levelTypeDropdown.props().value).to.equal('');
    levelTypeDropdown.simulate('change', {target: {value: 'Dancelab'}});
    expect(handleChangeLevelType).to.have.been.calledOnce;

    const scriptDropdown = wrapper.find('select').at(1);
    expect(scriptDropdown.props().value).to.equal('');
    scriptDropdown.simulate('change', {target: {value: 2}});
    expect(handleChangeScript).to.have.been.calledOnce;

    const ownerDropdown = wrapper.find('select').at(2);
    expect(ownerDropdown.props().value).to.equal('');
    ownerDropdown.simulate('change', {target: {value: 1}});
    expect(handleChangeOwner).to.have.been.calledOnce;

    const button = wrapper.find('button');
    button.simulate('click');
    expect(handleSearch).to.have.been.calledOnce;
  });
});
