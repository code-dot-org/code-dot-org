import React from 'react';
import {mount} from 'enzyme';
import {StickyContainer} from 'react-sticky';
import {expect} from '../../util/configuredChai';
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
    const wrapper = mount(
      <StickyContainer>
        <FilterHeader {...DEFAULT_PROPS} mobileLayout={true} />
      </StickyContainer>
    );
    expect(wrapper).to.containMatchingElement(
      <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" onClick={FAKE_SHOW_MODAL_FILTERS}>
        {i18n.filterHeaderShowFilters()}
      </button>
    );
  });

  it('renders open modal filters on mobile view', () => {
    const wrapper = mount(
      <StickyContainer>
        <FilterHeader
          {...DEFAULT_PROPS}
          mobileLayout={true}
          showingModalFilters={true}
        />
      </StickyContainer>
    );
    expect(wrapper).to.containMatchingElement(
      <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}</span>
    );
    expect(wrapper).to.containMatchingElement(
      <button type="button" onClick={FAKE_HIDE_MODAL_FILTERS}>
        {i18n.filterHeaderHideFilters()}
      </button>
    );
  });

  it('adds a back button if requested', () => {
    const wrapper = mount(
      <StickyContainer>
        <FilterHeader {...DEFAULT_PROPS} backButton={true} />
      </StickyContainer>
    );
    expect(wrapper).to.containMatchingElement(<BackButton />);
  });

  it('pluralizes result summary correctly', () => {
    const noResults = mount(
      <StickyContainer>
        <FilterHeader
          {...DEFAULT_PROPS}
          mobileLayout={true}
          filteredTutorialsCount={0}
        />
      </StickyContainer>
    );
    expect(noResults).to.containMatchingElement(
      <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 0})}</span>
    );

    const oneResult = mount(
      <StickyContainer>
        <FilterHeader
          {...DEFAULT_PROPS}
          filteredTutorialsCount={1}
          mobileLayout={true}
        />
      </StickyContainer>
    );
    expect(oneResult).to.containMatchingElement(
      <span>{i18n.filterHeaderTutorialCountSingle()}</span>
    );

    const twoResults = mount(
      <StickyContainer>
        <FilterHeader
          {...DEFAULT_PROPS}
          filteredTutorialsCount={2}
          mobileLayout={true}
        />
      </StickyContainer>
    );
    expect(twoResults).to.containMatchingElement(
      <span>{i18n.filterHeaderTutorialCountPlural({tutorial_count: 2})}</span>
    );
  });
});
