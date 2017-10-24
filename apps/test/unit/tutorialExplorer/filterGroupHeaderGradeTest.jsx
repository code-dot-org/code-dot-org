import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import sinon from 'sinon';
import FilterGroupHeaderGrade from '@cdo/apps/tutorialExplorer/filterGroupHeaderGrade';

const FAKE_ON_USER_INPUT = () => {};
const DEFAULT_PROPS = {
  filterGroup:
    {
      name: 'group-1',
      text: 'Group 1',
      entries: [{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}],
      singleEntry: false
    },
  selection: ['frobozz'],
  onUserInput: FAKE_ON_USER_INPUT
};

describe('FilterGroupHeaderGrade', () => {
  it('hits a callback when option clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <FilterGroupHeaderGrade
        {...DEFAULT_PROPS}
        onUserInput={spy}
      />
    );
    wrapper.childAt(1).simulate('click');
    expect(spy).to.have.been.calledOnce.and.calledWith('group-1', 'frobozz', true);
  });

});
