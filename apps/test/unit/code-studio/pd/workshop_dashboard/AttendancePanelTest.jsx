import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import AttendancePanel from '@cdo/apps/code-studio/pd/workshop_dashboard/AttendancePanel';

describe('AttendancePanel', () => {
  it('renders', () => {
    shallow(<AttendancePanel sessions={[]} />, {
      context: {router: {push: sinon.spy()}}
    });
  });
});
