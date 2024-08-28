import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Factory} from 'rosie';

import AttendancePanel from '@cdo/apps/code-studio/pd/workshop_dashboard/AttendancePanel';

import {stubWindowDashboard} from '../../../../util/testUtils';

import './workshopFactory';

describe('AttendancePanel', () => {
  stubWindowDashboard({
    CODE_ORG_URL: '//test.code.org',
  });

  it('renders', () => {
    shallow(
      <AttendancePanel
        sessions={[
          Factory.build('session', {['show_link?']: true}),
          Factory.build('session', {['show_link?']: false}),
        ]}
      />,
      {
        context: {router: {push: jest.fn(), createHref: jest.fn()}},
      }
    );
  });
});
