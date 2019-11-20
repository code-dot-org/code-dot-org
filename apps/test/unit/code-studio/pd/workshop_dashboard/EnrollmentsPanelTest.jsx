import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Factory} from 'rosie';
import EnrollmentsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/EnrollmentsPanel';
import './workshopFactory';

describe('EnrollmentsPanel', () => {
  it('renders', () => {
    const workshop = Factory.build('workshop');
    shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        enrollments={[]}
        loadEnrollments={sinon.spy()}
      />
    );
  });
});
