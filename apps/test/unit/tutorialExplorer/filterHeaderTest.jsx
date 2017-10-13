import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../util/configuredChai';
import {TutorialsSortBy} from '@cdo/apps/tutorialExplorer/util';
import FilterHeader from '@cdo/apps/tutorialExplorer/filterHeader';
import BackButton from '@cdo/apps/tutorialExplorer/backButton';

const FAKE_ON_USER_INPUT = () => {};
const FAKE_SHOW_MODAL_FILTERS = () => {};
const FAKE_HIDE_MODAL_FILTERS = () => {};
const DEFAULT_PROPS = {
  onUserInput: FAKE_ON_USER_INPUT,
  sortBy: TutorialsSortBy.default,
  backButton: false,
  filteredTutorialsCount: 5,
  mobileLayout: false,
  showingModalFilters: false,
  showModalFilters: FAKE_SHOW_MODAL_FILTERS,
  hideModalFilters: FAKE_HIDE_MODAL_FILTERS,
  showSortDropdown: false,
  defaultSortBy: TutorialsSortBy.default
};

describe('FilterHeader', () => {
  it('renders simplest possible view', () => {
    const wrapper = shallow(
      <FilterHeader {...DEFAULT_PROPS}/>
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>Filter By</div>
        </div>
        <div>
          <span>5 results</span>
          &nbsp;
          &nbsp;
        </div>
      </div>
    );
  });

  it('renders with sort dropdown', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        showSortDropdown={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <div>Filter By</div>
        </div>
        <div>
          <span>5 results</span>
          &nbsp;
          &nbsp;
          <select value={TutorialsSortBy.default}>
            <option>
              Sort
            </option>
            <option value="displayweight">
              Recommended
            </option>
            <option value="popularityrank">
              Most popular
            </option>
          </select>
        </div>
      </div>
    );
  });

  it('shows the default sort criteria first', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        showSortDropdown={true}
        defaultSortBy={TutorialsSortBy.popularityrank}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <select value={TutorialsSortBy.default}>
        <option>
          Sort
        </option>
        <option value="popularityrank">
          Most popular
        </option>
        <option value="displayweight">
          Recommended
        </option>
      </select>
    );
  });

  it('hits a callback when sort settings change', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        showSortDropdown={true}
        onUserInput={spy}
      />
    );
    wrapper.find('select').simulate('change', {target:{value: 'displayweight'}});
    expect(spy).to.have.been.calledOnce.and.calledWith('displayweight');
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
          <span>5 results</span>
        </div>
        <div>
          &nbsp;
          &nbsp;
          <span>
            &nbsp;
            &nbsp;
            <button onClick={FAKE_SHOW_MODAL_FILTERS}>
              Filters
            </button>
          </span>
        </div>
      </div>
    );
  });

  it('renders with sort dropdown on mobile', () => {
    const wrapper = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        mobileLayout={true}
        showSortDropdown={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div>
          <span>5 results</span>
        </div>
        <div>
          &nbsp;
          &nbsp;
          <select value={TutorialsSortBy.default}>
            <option>
              Sort
            </option>
            <option value="displayweight">
              Recommended
            </option>
            <option value="popularityrank">
              Most popular
            </option>
          </select>
          <span>
            &nbsp;
            &nbsp;
            <button onClick={FAKE_SHOW_MODAL_FILTERS}>
              Filters
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
          <span>5 results</span>
        </div>
        <div>
          &nbsp;
          &nbsp;
          <span>
            &nbsp;
            &nbsp;
            <button onClick={FAKE_HIDE_MODAL_FILTERS}>
              Apply
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
      <span>0 results</span>
    );

    const oneResult = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={1}
      />
    );
    expect(oneResult).to.containMatchingElement(
      <span>1 result</span>
    );

    const twoResults = shallow(
      <FilterHeader
        {...DEFAULT_PROPS}
        filteredTutorialsCount={2}
      />
    );
    expect(twoResults).to.containMatchingElement(
      <span>2 results</span>
    );
  });
});
