import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Factory} from 'rosie';
import {stubWindowDashboard} from '../../../../util/testUtils';
import './workshopFactory';
import AttendancePanel from '@cdo/apps/code-studio/pd/workshop_dashboard/AttendancePanel';

describe('AttendancePanel', () => {
  stubWindowDashboard({
    CODE_ORG_URL: '//test.code.org'
  });

  it('renders', () => {
    shallow(
      <AttendancePanel
        sessions={[
          Factory.build('session', {['show_link?']: true}),
          Factory.build('session', {['show_link?']: false})
        ]}
      />,
      {
        context: {router: {push: sinon.spy(), createHref: sinon.spy()}}
      }
    );
  });
});
