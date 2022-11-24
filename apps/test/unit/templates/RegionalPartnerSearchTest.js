import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedRegionalPartnerSearch as RegionalPartnerSearch} from '@cdo/apps/templates/RegionalPartnerSearch';
import {WorkshopApplicationStates} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

const MINIMUM_PROPS = {
  responsiveSize: 'md'
};

describe('RegionalPartnerSearch', () => {
  let server;
  beforeEach(() => {
    sinon.stub(utils, 'currentLocation').returns({search: '?zip=11111'});
    server = sinon.fakeServer.create();
  });

  afterEach(() => {
    utils.currentLocation.restore();
    server.restore();
  });

  it('renders form for zip code', () => {
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    expect(wrapper.find('form')).not.to.be.null;
    expect(wrapper.find('form').text()).to.contain('ZIP');
  });
  it('shows StartApplicationButton if RP found and applications are open', () => {
    const response = {
      application_state: {
        state: WorkshopApplicationStates.currently_open
      },
      summer_workshops: [],
      pl_programs_offered: ['CSD', 'CSP', 'CSA']
    };
    server.respondWith(
      /.*regional_partners\/find\?zip_code.*/,
      JSON.stringify(response)
    );
    server.respondWith(
      /.*pd\/application\/applications_closed.*/,
      JSON.stringify(false)
    );

    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('StartApplicationButton')).not.to.be.null;
  });
});
