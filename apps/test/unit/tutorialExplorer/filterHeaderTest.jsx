import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../util/reconfiguredChai';
import FilterHeader from '@cdo/apps/tutorialExplorer/filterHeader';
import BackButton from '@cdo/apps/tutorialExplorer/backButton';
import i18n from '@cdo/tutorialExplorer/locale';

const FAKE_ON_USER_INPUT = () => {};
const FAKE_ON_ORG_NAME = () => {};
const FAKE_SHOW_MODAL_FILTERS = () => {};
const FAKE_HIDE_MODAL_FILTERS = () => {};
const DEFAULT_PROPS = {
  backButton: false,
  filteredTutorialsCount: 5,
  mobileLayout: false,
  showingModalFilters: false,
  showModalFilters: FAKE_SHOW_MODAL_FILTERS,
  hideModalFilters: FAKE_HIDE_MODAL_FILTERS,
  filterGroups: [],
  selection: {},
  onUserInputFilter: FAKE_ON_USER_INPUT,
  onUserInputOrgName: FAKE_ON_ORG_NAME
};

describe('FilterHeader', () => {
  it('renders simplest mobile view', () => {
    const wrapper = shallow(
      <FilterHeader {...DEFAULT_PROPS} mobileLayout={true} />
    );
    assert(
      wrapper.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
      )
    );
    assert(
      wrapper.containsMatchingElement(
        <button type="button" onClick={FAKE_SHOW_MODAL_FILTERS}>
          {i18n.filterHeaderShowFilters()}
        </button>
      )
    );
  });

  it('renders open modal filters on mobile view', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
        showingModalFilters={true}
      />
    );
    assert(
      wrapper.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
      )
    );
    assert(
      wrapper.containsMatchingElement(
        <button type="button" onClick={FAKE_HIDE_MODAL_FILTERS}>
          {i18n.filterHeaderHideFilters()}
        </button>
      )
    );
  });

  it('adds a back button if requested', () => {
    const wrapper = shallow(
      <FilterHeader {...DEFAULT_PROPS} backButton={true} />
    );
    assert(wrapper.containsMatchingElement(<BackButton />));
  });

  it('pluralizes result summary correctly', () => {
    const noResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
        filteredTutorialsCount={0}
      />
    );
    assert(
      noResults.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 0})}</span>
      )
    );

    const oneResult = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={1}
        mobileLayout={true}
      />
    );
    assert(
      oneResult.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountSingle()}</span>
      )
    );

    const twoResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={2}
        mobileLayout={true}
      />
    );
    assert(
      twoResults.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 2})}</span>
      )
    );
  });
});
