import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';

import RegionalPartnerPlaybook from '@cdo/apps/lib/ui/RegionalPartnerPlaybook';
import ResourceCard from '@cdo/apps/templates/studioHomepages/ResourceCard';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';

import {expect} from '../../../util/reconfiguredChai';

describe('RegionalPartnerPlaybook', () => {
  let store;

  beforeEach(() => {
    registerReducers({isRtl, responsive});
    store = getStore();
  });

  it('renders', () => {
    const wrapper = mount(
      <Provider store={store}>
        <RegionalPartnerPlaybook />
      </Provider>
    );
    expect(wrapper.find(ResourceCard)).to.have.lengthOf(18);
  });
});
