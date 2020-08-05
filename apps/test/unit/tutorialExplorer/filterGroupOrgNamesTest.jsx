import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/deprecatedChai';
import FilterGroupOrgNames from '@cdo/apps/tutorialExplorer/filterGroupOrgNames';
import FilterGroupContainer from '@cdo/apps/tutorialExplorer/filterGroupContainer';
import i18n from '@cdo/tutorialExplorer/locale';

const TEST_ORG_NAME = 'Code Studio';
const ORG_1 = 'Hogwarts School';
const ORG_2 = 'Miskatonic University';
const ORG_3 = 'Starfleet Academy';
const TEST_UNIQUE_ORG_NAMES = [ORG_1, ORG_2, ORG_3];
const TEST_CALLBACK = () => {};
const DEFAULT_PROPS = {
  orgName: TEST_ORG_NAME,
  uniqueOrgNames: TEST_UNIQUE_ORG_NAMES,
  onUserInput: TEST_CALLBACK
};

describe('FilterGroupOrgNames', () => {
  it('renders', () => {
    const wrapper = shallow(<FilterGroupOrgNames {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(
      <FilterGroupContainer text={i18n.filterOrgNames()}>
        <label htmlFor="filter-org-names-dropdown" className="hidden-label">
          {i18n.filterOrgNames()}
        </label>
        <select
          id="filter-org-names-dropdown"
          value={TEST_ORG_NAME}
          className="noFocusButton"
        >
          <option key="all" value="all">
            {i18n.filterOrgNamesAll()}
          </option>
          <option key={ORG_1} value={ORG_1}>
            {ORG_1}
          </option>
          <option key={ORG_2} value={ORG_2}>
            {ORG_2}
          </option>
          <option key={ORG_3} value={ORG_3}>
            {ORG_3}
          </option>
        </select>
      </FilterGroupContainer>
    );
  });

  it('truncates org names longer than 25 characters', () => {
    const LEN_25 = 'ABCDEFGHIJKLMNOPQRSTUVWXY';
    const LEN_26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const wrapper = shallow(
      <FilterGroupOrgNames
        {...DEFAULT_PROPS}
        uniqueOrgNames={[LEN_25, LEN_26]}
      />
    );

    // 25-char name is unchanged
    expect(wrapper).to.containMatchingElement(
      <option key={LEN_25} value={LEN_25}>
        ABCDEFGHIJKLMNOPQRSTUVWXY
      </option>
    );

    // 26-char name is truncated
    expect(wrapper).to.containMatchingElement(
      <option key={LEN_26} value={LEN_26}>
        ABCDEFGHIJKLMNOPQRSTUVWXY...
      </option>
    );
  });

  it('reports to callback on change', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <FilterGroupOrgNames {...DEFAULT_PROPS} onUserInput={spy} />
    );
    wrapper.find('select').simulate('change', {target: {value: ORG_1}});
    expect(spy).to.have.been.calledOnce.and.calledWith(ORG_1);
  });
});
