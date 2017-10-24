import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import {TutorialsSortBy} from '@cdo/apps/tutorialExplorer/util';
import FilterSet from '@cdo/apps/tutorialExplorer/filterSet';
import FilterGroup from '@cdo/apps/tutorialExplorer/filterGroup';
import FilterGroupOrgNames from '@cdo/apps/tutorialExplorer/filterGroupOrgNames';
import RoboticsButton from '@cdo/apps/tutorialExplorer/roboticsButton';

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
  defaultSortBy: TutorialsSortBy.popularityrank,
  sortBy: TutorialsSortBy.popularityrank,
  filterGroups: [
    {
      name: 'group-1',
      text: 'Group 1',
      entries: [],
      singleEntry: false
    },
    {
      name: 'group-2',
      text: 'Group 2',
      entries: ['byzanz', 'frobozz', 'xyzzy'],
      singleEntry: false
    }
  ],
  selection: {
    'group-1': [],
    'group-2': ['xyzzy'],
  },
  filteredTutorialsCount: 2,
  onUserInputFilter: FAKE_ON_USER_INPUT,
  onUserInputOrgName: FAKE_ON_ORG_NAME,
  onUserInputSortBy: FAKE_ON_SORT_BY
};

describe('FilterSet', () => {
  it('renders the provided filter groups', () => {
    const wrapper = shallow(<FilterSet {...DEFAULT_PROPS}/>);
    /*expect(wrapper).to.containMatchingElement(
      <FilterGroupSortBy
        defaultSortBy={TutorialsSortBy.popularityrank}
        sortBy={TutorialsSortBy.popularityrank}
        onUserInput={FAKE_ON_SORT_BY}
      />
    );*/
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
        filterEntries={['byzanz', 'frobozz', 'xyzzy']}
        onUserInput={FAKE_ON_USER_INPUT}
        selection={['xyzzy']}
        singleEntry={false}
      />
    );
  });

  it('adds a robotics button if a URL is provided', () => {
    const wrapper = shallow(
      <FilterSet
        {...DEFAULT_PROPS}
        roboticsButtonUrl="https://example.com"
      />
    );
    expect(wrapper).to.containMatchingElement(
      <RoboticsButton url="https://example.com"/>
    );
  });
});
