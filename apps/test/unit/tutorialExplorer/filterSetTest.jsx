import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import FilterGroup from '@cdo/apps/tutorialExplorer/filterGroup';
import FilterGroupOrgNames from '@cdo/apps/tutorialExplorer/filterGroupOrgNames';
import FilterSet from '@cdo/apps/tutorialExplorer/filterSet';
import {TutorialsSortByOptions} from '@cdo/apps/tutorialExplorer/util';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const FAKE_ON_USER_INPUT = () => {};
const FAKE_ORG_NAME = 'fake org name';
const FAKE_UNIQUE_ORG_NAMES = ['Acme', 'Buy N Large'];
const FAKE_ON_ORG_NAME = () => {};
const FAKE_ON_SORT_BY = () => {};
const DEFAULT_PROPS = {
  mobileLayout: false,
  uniqueOrgNames: FAKE_UNIQUE_ORG_NAMES,
  orgName: FAKE_ORG_NAME,
  showSortDropdown: true,
  defaultSortBy: TutorialsSortByOptions.popularityrank,
  sortBy: TutorialsSortByOptions.popularityrank,
  filterGroups: [
    {
      name: 'group-1',
      text: 'Group 1',
      entries: [],
      singleEntry: false,
    },
    {
      name: 'group-2',
      text: 'Group 2',
      entries: [{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}],
      singleEntry: false,
    },
  ],
  selection: {
    'group-1': [],
    'group-2': ['xyzzy'],
  },
  onUserInputFilter: FAKE_ON_USER_INPUT,
  onUserInputOrgName: FAKE_ON_ORG_NAME,
  onUserInputSortBy: FAKE_ON_SORT_BY,
};

describe('FilterSet', () => {
  it('renders the provided filter groups', () => {
    const wrapper = shallow(<FilterSet {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(
      <FilterGroupOrgNames
        orgName={FAKE_ORG_NAME}
        uniqueOrgNames={FAKE_UNIQUE_ORG_NAMES}
        onUserInput={FAKE_ON_ORG_NAME}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <FilterGroup
        key="group-1"
        name="group-1"
        text="Group 1"
        filterEntries={[]}
        onUserInput={FAKE_ON_USER_INPUT}
        selection={[]}
        singleEntry={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <FilterGroup
        key="group-2"
        name="group-2"
        text="Group 2"
        filterEntries={[{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}]}
        onUserInput={FAKE_ON_USER_INPUT}
        selection={['xyzzy']}
        singleEntry={false}
      />
    );
  });

  it('hides items when they should not be displayed', () => {
    const wrapper = shallow(
      <FilterSet
        {...DEFAULT_PROPS}
        filterGroups={[
          {
            name: 'group-1',
            text: 'Group 1',
            entries: [{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}],
            singleEntry: false,
            display: false,
          },
        ]}
      />
    );
    expect(wrapper.children()).to.have.length(2);
  });

  it('shows all items when using mobile layout', () => {
    const wrapper = shallow(
      <FilterSet
        {...DEFAULT_PROPS}
        mobileLayout={true}
        filterGroups={[
          {
            name: 'group-1',
            text: 'Group 1',
            entries: [{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}],
            singleEntry: false,
            headerOnDesktop: true,
          },
        ]}
      />
    );
    expect(wrapper.children()).to.have.length(3);
  });

  it('hides desktop items when using mobile layout', () => {
    const wrapper = shallow(
      <FilterSet
        {...DEFAULT_PROPS}
        mobileLayout={false}
        filterGroups={[
          {
            name: 'group-1',
            text: 'Group 1',
            entries: [{name: 'byzanz'}, {name: 'frobozz'}, {name: 'xyzzy'}],
            singleEntry: false,
            headerOnDesktop: true,
          },
        ]}
      />
    );
    expect(wrapper.children()).to.have.length(2);
  });
});
