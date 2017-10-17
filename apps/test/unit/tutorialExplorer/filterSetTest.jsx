import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import FilterSet from '@cdo/apps/tutorialExplorer/filterSet';
import FilterGroup from '@cdo/apps/tutorialExplorer/filterGroup';
import FilterGroupOrgNames from '@cdo/apps/tutorialExplorer/filterGroupOrgNames';
import RoboticsButton from '@cdo/apps/tutorialExplorer/roboticsButton';

const FAKE_ON_USER_INPUT = () => {};
const FAKE_ORG_NAME = 'fake org name';
const FAKE_UNIQUE_ORG_NAMES = ['Acme', 'Buy N Large'];
const FAKE_ON_ORG_NAME = () => {};
const DEFAULT_PROPS = {
  filterGroups: [
    {
      name: 'group-1',
      text: 'Group 1',
      entries: [],
    },
    {
      name: 'group-2',
      text: 'Group 2',
      entries: ['byzanz', 'frobozz', 'xyzzy'],
    }
  ],
  onUserInput: FAKE_ON_USER_INPUT,
  selection: {
    'group-1': [],
    'group-2': ['xyzzy'],
  },
  orgName: FAKE_ORG_NAME,
  uniqueOrgNames: FAKE_UNIQUE_ORG_NAMES,
  onUserInputOrgName: FAKE_ON_ORG_NAME,
};

describe('FilterSet', () => {
  it('renders the provided filter groups', () => {
    const wrapper = shallow(<FilterSet {...DEFAULT_PROPS}/>);
    expect(wrapper).to.containMatchingElement(
      <div>
        <FilterGroupOrgNames
          orgName={FAKE_ORG_NAME}
          uniqueOrgNames={FAKE_UNIQUE_ORG_NAMES}
          onUserInput={FAKE_ON_ORG_NAME}
        />
        <FilterGroup
          key="group-1"
          name="group-1"
          text="Group 1"
          filterEntries={[]}
          onUserInput={FAKE_ON_USER_INPUT}
          selection={[]}
        />
        <FilterGroup
          key="group-2"
          name="group-2"
          text="Group 2"
          filterEntries={['byzanz', 'frobozz', 'xyzzy']}
          onUserInput={FAKE_ON_USER_INPUT}
          selection={['xyzzy']}
        />
      </div>
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
