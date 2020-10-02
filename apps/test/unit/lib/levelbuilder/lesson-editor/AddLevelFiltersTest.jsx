import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddLevelFilters from '@cdo/apps/lib/levelbuilder/lesson-editor/AddLevelFilters';
import sinon from 'sinon';

describe('AddLevelFilters', () => {
  let defaultProps, handleSearch;
  beforeEach(() => {
    handleSearch = sinon.spy();
    defaultProps = {
      searchFields: {
        levelOptions: [['All types', ''], ['Dancelab', 'Dancelab']],
        scriptOptions: [['All scripts', ''], ['jigsaw', 2]],
        ownerOptions: [['Any owner', ''], ['Levelbuilder', 1]]
      },
      handleSearch
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

    const levelTypeDropdown = wrapper.find('select').at(0);
    expect(levelTypeDropdown.props().value).to.equal('');
    levelTypeDropdown.simulate('change', {target: {value: 'Dancelab'}});

    const scriptDropdown = wrapper.find('select').at(1);
    expect(scriptDropdown.props().value).to.equal('');
    scriptDropdown.simulate('change', {target: {value: 2}});

    const ownerDropdown = wrapper.find('select').at(2);
    expect(ownerDropdown.props().value).to.equal('');
    ownerDropdown.simulate('change', {target: {value: 1}});

    const button = wrapper.find('button');
    button.simulate('click');
    expect(handleSearch).to.have.been.calledOnce;

    expect(wrapper.state().levelName).to.equal('Level Name');
    expect(wrapper.state().levelType).to.equal('Dancelab');
    expect(wrapper.state().scriptId).to.equal(2);
    expect(wrapper.state().ownerId).to.equal(1);
  });
});
