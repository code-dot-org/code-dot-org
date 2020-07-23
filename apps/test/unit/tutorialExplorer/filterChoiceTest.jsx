import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/deprecatedChai';
import FilterChoice from '@cdo/apps/tutorialExplorer/filterChoice';

const TEST_GROUP_NAME = 'Mansfield Park';
const TEST_NAME = 'Persuasion';
const TEST_TEXT = 'Pride and Prejudice';
const DEFAULT_PROPS = {
  onUserInput: () => {},
  groupName: TEST_GROUP_NAME,
  name: TEST_NAME,
  selected: false,
  text: TEST_TEXT,
  singleEntry: false
};

describe('FilterChoice', () => {
  it('renders unchecked without error', () => {
    const wrapper = shallow(
      <FilterChoice {...DEFAULT_PROPS} selected={false} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <label>
          <input type="checkbox" checked={false} />
          {TEST_TEXT}
        </label>
      </div>
    );
  });

  it('renders checked without error', () => {
    const wrapper = shallow(
      <FilterChoice {...DEFAULT_PROPS} selected={true} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <label>
          <input type="checkbox" checked={true} />
          {TEST_TEXT}
        </label>
      </div>
    );
  });

  it('renders unchecked radio button without error', () => {
    const wrapper = shallow(
      <FilterChoice {...DEFAULT_PROPS} selected={false} singleEntry={true} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <label>
          <input type="radio" checked={false} />
          {TEST_TEXT}
        </label>
      </div>
    );
  });

  it('Calls provided handler on change', () => {
    const callback = sinon.spy();
    const testNewCheckedValue = Math.random() < 0.5;
    const wrapper = shallow(
      <FilterChoice {...DEFAULT_PROPS} onUserInput={callback} />
    );

    wrapper.find('input').simulate('change', {
      target: {
        checked: testNewCheckedValue
      }
    });

    expect(callback).to.have.been.calledOnce.and.calledWith(
      TEST_GROUP_NAME,
      TEST_NAME,
      testNewCheckedValue
    );
  });
});
