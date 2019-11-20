import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import EnrollmentsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/EnrollmentsPanel';
import './workshopFactory';

describe('EnrollmentsPanel', () => {
  it('shows a spinner when enrollments are loading', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={true}
        enrollments={[]}
        loadEnrollments={sinon.spy()}
      />
    );
    assert(wrapper.find('Spinner').exists(), 'Spinner was rendered');
    assert(
      !wrapper.find('WorkshopEnrollment').exists(),
      'WorkshopEnrollment was not rendered'
    );
  });

  it('shows WorkshopEnrollment when enrollments are done loading', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        loadEnrollments={sinon.spy()}
      />
    );
    assert(
      wrapper.find('WorkshopEnrollment').exists(),
      'WorkshopEnrollment was rendered'
    );
  });

  it('shows a "move" button to admins', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        isWorkshopAdmin
        loadEnrollments={sinon.spy()}
      />
    );
    // We have to deep-render the header to check for the button there
    const headerWrapper = mount(wrapper.prop('header'));
    assert(
      headerWrapper
        .find('Button')
        .filterWhere(n => n.text().includes('Move (admin)'))
        .exists(),
      'Move button was rendered'
    );
  });
});
