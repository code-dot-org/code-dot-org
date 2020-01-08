import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import sinon from 'sinon';
import FilterGroupHeaderSelection from '@cdo/apps/tutorialExplorer/filterGroupHeaderSelection';

const FAKE_ON_USER_INPUT = () => {};
const DEFAULT_PROPS = {
  containerStyle: {},
  filterGroup: {
    name: 'group-1',
    text: 'Group 1',
    entries: [
      {name: 'byzanz'},
      {name: 'frobozz'},
      {name: 'xyzzy'},
      {name: 'bor'}
    ],
    singleEntry: false
  },
  selection: ['frobozz'],
  onUserInput: FAKE_ON_USER_INPUT
};

function getItemBorderLeft(wrapper, itemIndex) {
  return wrapper
    .childAt(0)
    .childAt(itemIndex)
    .props().style.borderLeft;
}

describe('FilterGroupHeaderSelection', () => {
  it('hits a callback when option clicked', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <FilterGroupHeaderSelection {...DEFAULT_PROPS} onUserInput={spy} />
    );
    wrapper
      .childAt(0)
      .childAt(1)
      .simulate('click');
    expect(spy).to.have.been.calledOnce.and.calledWith(
      'group-1',
      'frobozz',
      true
    );
  });

  it('has borders separating adjacent unselected items', () => {
    const wrapper = shallow(<FilterGroupHeaderSelection {...DEFAULT_PROPS} />);

    const borderLeftSelect = 'solid 1px #2799a4';
    const borderLeftItem = 'solid 1px white';
    const borderLeftBorder = 'solid 1px #a2a2a2';

    // This item is selected.
    expect(getItemBorderLeft(wrapper, 1)).is.equal(borderLeftSelect);

    // This item is after selected, and therefore has no left border.
    expect(getItemBorderLeft(wrapper, 2)).is.equal(borderLeftItem);

    // This item is after a regular item, so it has a simple grey border.
    expect(getItemBorderLeft(wrapper, 3)).is.equal(borderLeftBorder);
  });
});
