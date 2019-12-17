import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import FilterChoice from '@cdo/apps/tutorialExplorer/filterChoice';
import FilterGroup from '@cdo/apps/tutorialExplorer/filterGroup';
import FilterGroupContainer from '@cdo/apps/tutorialExplorer/filterGroupContainer';

const TEST_GROUP_NAME = 'Redwall';
const TEST_TEXT = 'Mossflower';
const TEST_CALLBACK = () => {};
const DEFAULT_PROPS = {
  name: TEST_GROUP_NAME,
  text: TEST_TEXT,
  filterEntries: [],
  selection: [],
  onUserInput: TEST_CALLBACK,
  singleEntry: false
};

describe('FilterGroup', () => {
  it('renders with multiple filterEntries', () => {
    const wrapper = shallow(
      <FilterGroup
        {...DEFAULT_PROPS}
        filterEntries={[
          {
            name: 'Martin the Warrior',
            text: 'The Bellmaker'
          },
          {
            name: 'The Legend of Luke',
            text: 'The Long Patrol'
          }
        ]}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <FilterGroupContainer text={TEST_TEXT}>
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="Martin the Warrior"
          text="The Bellmaker"
          selected={false}
          onUserInput={TEST_CALLBACK}
          key="Martin the Warrior"
          singleEntry={false}
        />
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="The Legend of Luke"
          text="The Long Patrol"
          selected={false}
          onUserInput={TEST_CALLBACK}
          key="The Legend of Luke"
          singleEntry={false}
        />
      </FilterGroupContainer>
    );
  });

  it('renders radio buttons', () => {
    const wrapper = shallow(
      <FilterGroup
        {...DEFAULT_PROPS}
        filterEntries={[
          {
            name: 'Martin the Warrior',
            text: 'The Bellmaker'
          }
        ]}
        singleEntry={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <FilterGroupContainer text={TEST_TEXT}>
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="Martin the Warrior"
          text="The Bellmaker"
          selected={false}
          onUserInput={TEST_CALLBACK}
          key="Martin the Warrior"
          singleEntry={true}
        />
      </FilterGroupContainer>
    );
  });

  it('selects choices by name', () => {
    const wrapper = shallow(
      <FilterGroup
        {...DEFAULT_PROPS}
        filterEntries={[
          {
            name: 'Mariel of Redwall',
            text: ''
          },
          {
            name: 'Mattimeo',
            text: ''
          },
          {
            name: 'Triss',
            text: ''
          }
        ]}
        selection={['Mariel of Redwall', 'Triss']}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <FilterGroupContainer text={TEST_TEXT}>
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="Mariel of Redwall"
          text=""
          selected={true}
          onUserInput={TEST_CALLBACK}
          key="Mariel of Redwall"
          singleEntry={false}
        />
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="Mattimeo"
          text=""
          selected={false}
          onUserInput={TEST_CALLBACK}
          key="Mattimeo"
          singleEntry={false}
        />
        <FilterChoice
          groupName={TEST_GROUP_NAME}
          name="Triss"
          text=""
          selected={true}
          onUserInput={TEST_CALLBACK}
          key="Triss"
          singleEntry={false}
        />
      </FilterGroupContainer>
    );
  });
});
