import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import FilterGroupSortBy from '@cdo/apps/tutorialExplorer/filterGroupSortBy';
import {TutorialsSortByOptions} from '@cdo/apps/tutorialExplorer/util';
import i18n from '@cdo/tutorialExplorer/locale';

import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const FAKE_ON_SORT_BY = () => {};
const DEFAULT_PROPS = {
  defaultSortBy: 'popularityrank',
  sortBy: 'popularityrank',
  onUserInput: FAKE_ON_SORT_BY,
};

describe('FilterGroupSortBy', () => {
  it('shows the default sort criteria first', () => {
    const wrapper = shallow(
      <FilterGroupSortBy
        {...DEFAULT_PROPS}
        defaultSortBy={TutorialsSortByOptions.displayweight}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <select>
        <option value="displayweight">
          {i18n.filterSortByDisplayWeight()}
        </option>
        <option value="popularityrank">
          {i18n.filterSortByPopularityRank()}
        </option>
      </select>
    );
  });

  it('hits a callback when sort settings change', () => {
    const spy = sinon.spy();
    const wrapper = shallow(
      <FilterGroupSortBy {...DEFAULT_PROPS} onUserInput={spy} />
    );
    wrapper
      .find('select')
      .simulate('change', {target: {value: 'displayweight'}});
    expect(spy).to.have.been.calledOnce.and.calledWith('displayweight');
  });
});
