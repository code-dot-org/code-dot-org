import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import {Factory} from 'rosie';
import {Workshop} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import fakeWorkshopServer from './fakeWorkshopServer';
import './workshopFactory';

describe('Workshop', () => {
  let fakeServer, fakeWorkshop;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
    fakeServer = fakeWorkshopServer(fakeWorkshop);
  });

  afterEach(() => {
    fakeServer.restore();
  });

  it('renders', () => {
    const wrapper = shallow(
      <Workshop
        params={{workshopId: fakeWorkshop.id.toString()}}
        route={{}}
        permission={new Permission()}
      />,
      {context: {router: {}}}
    );
    fakeServer.respond();

    const metadata = wrapper.find('MetadataFooter');
    assert(metadata.exists(), 'The created_at footer exists');
    assert.equal(
      Date.parse(fakeWorkshop.created_at),
      Date.parse(metadata.prop('createdAt')),
      'The created_at footer contains the correct date'
    );
  });
});
