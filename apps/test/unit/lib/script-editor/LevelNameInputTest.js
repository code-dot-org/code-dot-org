import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import LevelNameInput from '@cdo/apps/lib/script-editor/LevelNameInput';

const levelKeyToIdMap = {
  'Level One': 1,
  'Level Two': 2,
  'Level Three': 3
};

describe('LevelNameInput', () => {
  let onSelectLevel, defaultProps;
  beforeEach(() => {
    onSelectLevel = sinon.spy();
    defaultProps = {
      onSelectLevel,
      levelKeyToIdMap,
      initialLevelName: 'Level One'
    };
  });

  it('renders a valid level', () => {
    const wrapper = shallow(<LevelNameInput {...defaultProps} />);
    const iconName = wrapper.find('FontAwesome').props().icon;
    expect(iconName).to.equal('check-circle');
  });

  it('responds to input', () => {
    const wrapper = shallow(<LevelNameInput {...defaultProps} />);
    let iconName = wrapper.find('FontAwesome').props().icon;
    expect(iconName).to.equal('check-circle');

    wrapper.find('input').simulate('change', {target: {value: 'Level'}});
    iconName = wrapper.find('FontAwesome').props().icon;
    expect(iconName).to.equal('times-circle');
    expect(onSelectLevel).not.to.have.been.called;

    wrapper.find('input').simulate('change', {target: {value: 'Level Two'}});
    iconName = wrapper.find('FontAwesome').props().icon;
    expect(iconName).to.equal('check-circle');
    expect(onSelectLevel).to.have.been.calledWith(2);
  });

  it('renders a blank level', () => {
    const props = {
      ...defaultProps,
      initialLevelName: ''
    };
    const wrapper = shallow(<LevelNameInput {...props} />);
    const iconName = wrapper.find('FontAwesome').props().icon;
    expect(iconName).to.equal('times-circle');
  });
});
