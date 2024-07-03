import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import {isolateComponent} from 'isolate-react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {
  WorkshopApplicationStates,
  ActiveCourseWorkshops,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {UnconnectedRegionalPartnerSearch as RegionalPartnerSearch} from '@cdo/apps/templates/RegionalPartnerSearch';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const MINIMUM_PROPS = {
  responsiveSize: 'md',
};

// All course types of which programs can be offered (i.e. CSD, CSP, and CSA)
const ACTIVE_COURSES = Object.keys(ActiveCourseWorkshops);
// Offer programs of all but the last active course type (i.e. offer CSD and CSP, not CSA)
const OFFERED_PROGRAMS = ACTIVE_COURSES.slice(0, -1);
// Workshop for the first offered program (i.e. CSD)
const OFFERED_WORKSHOP = {
  course: ActiveCourseWorkshops[OFFERED_PROGRAMS[0]],
  workshop_date_range_string: 'Test CSD workshop dates',
  location_name: 'Test CSD workshop location',
  location_address: 'Test CSD workshop address',
};

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
        : WorkshopApplicationStates.currently_open,
    },
    summer_workshops: summerWorkshops || [],
    pl_programs_offered: programsOffered || [],
  };

  const responseWithoutRP = {
    error: 'no_partner',
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
  it('shows Not Offering note on workshop card(s) for the program(s) not being offered when other programs are offered', () => {
    createServerResponses(server, true, false, OFFERED_PROGRAMS, [
      OFFERED_WORKSHOP,
    ]);
    const wrapper = isolateComponent(
      <RegionalPartnerSearch {...MINIMUM_PROPS} />
    );
    server.respond();

    // Get the WorkshopCard of the course not being offered as a program
    const notOfferedWorkshopCard =
      wrapper.findAll('WorkshopCard')[ACTIVE_COURSES.length - 1];
    // Get WorkshopCard content
    const notOfferedWorkshopCardContent =
      notOfferedWorkshopCard.props.content.props.children[1].props.children.toString();

    // Ensure correct content for the WorkshopCard of the course not offered as a program
    expect(notOfferedWorkshopCardContent).to.contain(
      'This Regional Partner is not offering'
    );
    expect(notOfferedWorkshopCardContent).to.contain(
      ActiveCourseWorkshops[ACTIVE_COURSES[ACTIVE_COURSES.length - 1]]
    );
  });
  it('shows Details Coming Soon note on workshop card(s) for offered program(s) that do not currently have summer workshops', () => {
    createServerResponses(server, true, false, OFFERED_PROGRAMS, [
      OFFERED_WORKSHOP,
    ]);
    const wrapper = isolateComponent(
      <RegionalPartnerSearch {...MINIMUM_PROPS} />
    );
    server.respond();

    // Get the WorkshopCard of the offered course that does not have a workshop
    const offeredNoWSWorkshopCard = wrapper.findAll('WorkshopCard')[1];
    // Get WorkshopCard content
    const offeredNoWSWorkshopCardContent =
      offeredNoWSWorkshopCard.props.content.props.children[0].props.children.toString();

    // Ensure correct content for the WorkshopCard of the offered program without a workshop
    expect(offeredNoWSWorkshopCardContent).to.contain(
      'Workshop details are coming soon!'
    );
    expect(offeredNoWSWorkshopCardContent).to.contain(
      ActiveCourseWorkshops[OFFERED_PROGRAMS[1]]
    );
  });
  it('shows summer workshop details on workshop cards for offered programs with summer workshops', () => {
    createServerResponses(server, true, false, OFFERED_PROGRAMS, [
      OFFERED_WORKSHOP,
    ]);
    const wrapper = isolateComponent(
      <RegionalPartnerSearch {...MINIMUM_PROPS} />
    );
    server.respond();

    // Get the WorkshopCard of the offered course that has a workshop
    const offeredWithWSWorkshopCard = wrapper.findAll('WorkshopCard')[0];
    // Get WorkshopCard heading
    const offeredWithWSWorkshopCardHeading =
      offeredWithWSWorkshopCard.props.content.props.children[0].props.children;
    // Get WorkshopCard content
    const offeredWithWSWorkshopCardContent =
      offeredWithWSWorkshopCard.props.content.props.children[1][0].props
        .children[1].props.children;

    // Ensure correct heading and content for the WorkshopCard of the offered program with a workshop
    expect(offeredWithWSWorkshopCardHeading).to.contain(
      ActiveCourseWorkshops[OFFERED_PROGRAMS[0]]
    );
    expect(offeredWithWSWorkshopCardContent).to.contain(
      OFFERED_WORKSHOP.location_name
    );
  });
});
