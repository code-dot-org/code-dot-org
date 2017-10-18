import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import FilterHeader from '@cdo/apps/tutorialExplorer/filterHeader';
import BackButton from '@cdo/apps/tutorialExplorer/backButton';
import i18n from '@cdo/tutorialExplorer/locale';

const FAKE_SHOW_MODAL_FILTERS = () => {};
const FAKE_HIDE_MODAL_FILTERS = () => {};
const DEFAULT_PROPS = {
  backButton: false,
  filteredTutorialsCount: 5,
  mobileLayout: false,
  showingModalFilters: false,
  showModalFilters: FAKE_SHOW_MODAL_FILTERS,
  hideModalFilters: FAKE_HIDE_MODAL_FILTERS
};

describe('FilterHeader', () => {
  it('renders simplest possible view', () => {
    const wrapper = shallow(
      <FilterHeader {...DEFAULT_PROPS}/>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>
            {i18n.filterHeaderFilterBy()}
          </div>
        </div>
        <div>
          <span>
            {i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}
          </span>
          &nbsp;
          &nbsp;
        </div>
      </div>
    );
  });

  it('renders simplest mobile view', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <span>
            {i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}
          </span>
        </div>
        <div>
          &nbsp;
          &nbsp;
          <span>
            &nbsp;
            &nbsp;
            <button onClick={FAKE_SHOW_MODAL_FILTERS}>
              {i18n.filterHeaderShowFilters()}
            </button>
          </span>
        </div>
      </div>
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
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <span>
            {i18n.filterHeaderTutorialCountPlural({tutorial_count: 5})}
          </span>
        </div>
        <div>
          &nbsp;
          &nbsp;
          <span>
            &nbsp;
            &nbsp;
            <button onClick={FAKE_HIDE_MODAL_FILTERS}>
              {i18n.filterHeaderHideFilters()}
            </button>
          </span>
        </div>
      </div>
    );
  });

  it('adds a back button if requested', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        backButton={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <BackButton/>
    );
  });

  it('pluralizes result summary correctly', () => {
    const noResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={0}
      />
    );
    expect(noResults).to.containMatchingElement(
      <span>
        {i18n.filterHeaderTutorialCountPlural({tutorial_count: 0})}
      </span>
    );

    const oneResult = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={1}
      />
    );
    expect(oneResult).to.containMatchingElement(
      <span>
        {i18n.filterHeaderTutorialCountSingle()}
      </span>
    );

    const twoResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={2}
      />
    );
    expect(twoResults).to.containMatchingElement(
      <span>
        {i18n.filterHeaderTutorialCountPlural({tutorial_count: 2})}
      </span>
    );
  });
});
