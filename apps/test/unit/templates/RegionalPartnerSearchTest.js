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

// const testSummerWorkshop = courseKey => {
//   return {
//     course: ActiveCourseWorkshops[courseKey],
//     workshop_date_range_string: 'Test dates',
//     location_name: 'Test location',
//     location_address: 'Test address'
//   };
// };

const createServerResponses = (
  server,
  hasRP,
  applicationsClosed,
  programsOffered,
  summerWorkshops
) => {
  const responseWithRP = {
    application_state: {
      state: applicationsClosed
        ? WorkshopApplicationStates.now_closed
        : WorkshopApplicationStates.currently_open
    },
    summer_workshops: summerWorkshops || [],
    pl_programs_offered: programsOffered || []
  };

  const responseWithoutRP = {
    error: 'no_partner'
  };

  server.respondWith(
    /.*regional_partners\/find\?zip_code.*/,
    JSON.stringify(hasRP ? responseWithRP : responseWithoutRP)
  );
  server.respondWith(
    /.*pd\/application\/applications_closed.*/,
    JSON.stringify(applicationsClosed)
  );
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
    createServerResponses(server, true, false);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('StartApplicationButton')).not.to.be.null;
  });
  it('shows StartApplicationButton if no RP found and applications are open', () => {
    createServerResponses(server, false, false);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('StartApplicationButton')).not.to.be.null;
  });
  it('shows notify button if RP found and applications are closed', () => {
    createServerResponses(server, true, true);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('button').text()).to.contain('Notify me');
  });
  it('shows no button if no RP found and applications are closed', () => {
    createServerResponses(server, false, true);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('button')).to.have.length(0);
  });
  it('shows no workshop cards if RP not found', () => {
    createServerResponses(server, false, false);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('WorkshopCard')).to.have.length(0);
  });
  it('shows no workshop cards if RP is found but applications are closed', () => {
    createServerResponses(server, true, true);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('WorkshopCard')).to.have.length(0);
  });
  it('shows no workshop cards if RP is found and applications are open, but RP is not offering programs', () => {
    createServerResponses(server, true, false);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('WorkshopCard')).to.have.length(0);
  });
  it('shows workshop cards if RP found, applications are open, and RP is offering programs', () => {
    createServerResponses(server, true, false, ['CSD', 'CSP']);
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    server.respond();
    expect(wrapper.find('WorkshopCard')).to.have.length(3);
  });
  // it('shows Not Offering note on workshop card(s) for the program(s) not being offered when other programs are offered', () => {
  //   createServerResponses(
  //     server,
  //     true,
  //     false,
  //     ['CSD', 'CSP'],
  //     [testSummerWorkshop('CSD')]
  //   );
  //   const wrapper = isolateComponent(
  //     <RegionalPartnerSearch {...MINIMUM_PROPS} />
  //   );
  //   wrapper.setState({
  //     partnerInfo: {
  //       name: 'Reggie Partner',
  //       application_state: {state: WorkshopApplicationStates.currently_open},
  //       pl_programs_offered: ['CSD', 'CSP'],
  //       summer_workshops: [testSummerWorkshop('CSD')]
  //     },
  //     applicationsClosed: false
  //   });
  //   console.log(wrapper.debug());
  //   expect(wrapper.findAll('WorkshopCard')).to.have.length(3);
  // });
  // it('shows Details Coming Soon note on workshop card(s) for offered program(s) that do not currently have summer workshops', () => {
  // });
  // it('shows summer workshop details on workshop cards for offered programs with summer workshops', () => {
  // });
});
