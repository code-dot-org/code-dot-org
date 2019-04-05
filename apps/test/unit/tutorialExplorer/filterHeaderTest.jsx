import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
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
    expect(
      wrapper.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
      )
    ).to.be.ok;
    expect(
      wrapper.containsMatchingElement(
        <button type="button" onClick={FAKE_SHOW_MODAL_FILTERS}>
          {i18n.filterHeaderShowFilters()}
        </button>
      )
    ).to.be.ok;
  });

  it('renders open modal filters on mobile view', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
        showingModalFilters={true}
      />
    );
    expect(
      wrapper.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
      )
    ).to.be.ok;
    expect(
      wrapper.containsMatchingElement(
        <button type="button" onClick={FAKE_HIDE_MODAL_FILTERS}>
          {i18n.filterHeaderHideFilters()}
        </button>
      )
    ).to.be.ok;
  });

  it('adds a back button if requested', () => {
    const wrapper = shallow(
      <FilterHeader {...DEFAULT_PROPS} backButton={true} />
    );
    expect(wrapper.containsMatchingElement(<BackButton />)).to.be.ok;
  });

  it('pluralizes result summary correctly', () => {
    const noResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
        filteredTutorialsCount={0}
      />
    );
    expect(
      noResults.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 0})}</span>
      )
    ).to.be.ok;

    const oneResult = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={1}
        mobileLayout={true}
      />
    );
    expect(
      oneResult.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountSingle()}</span>
      )
    ).to.be.ok;

    const twoResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={2}
        mobileLayout={true}
      />
    );
    expect(
      twoResults.containsMatchingElement(
        <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 2})}</span>
      )
    ).to.be.ok;
  });
});
