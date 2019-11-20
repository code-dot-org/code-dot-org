import _ from 'lodash';
import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import EnrollmentsPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/EnrollmentsPanel';
import './workshopFactory';

describe('EnrollmentsPanel', () => {
  let server, loadEnrollments;

  beforeEach(() => {
    server = sinon.createFakeServer();
    loadEnrollments = sinon.spy();
  });

  afterEach(() => {
    server.restore();
    server = null;
  });

  it('shows a spinner when enrollments are loading', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={true}
        enrollments={[]}
        loadEnrollments={loadEnrollments}
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
        loadEnrollments={loadEnrollments}
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
        loadEnrollments={loadEnrollments}
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

  it('refresh the enrollments list', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );

    wrapper.instance().handleEnrollmentRefreshClick();
    assert(loadEnrollments.calledOnce);
  });

  it('open and close the move enrollments dialog', () => {
    const workshop = Factory.build('workshop');
    const enrollments = Factory.buildList('enrollment', 2);
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={enrollments}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );

    wrapper.instance().handleClickMove();
    wrapper.update();
    assert.isTrue(wrapper.state('isMoveEnrollmentsDialogOpen'));

    wrapper.instance().handleMoveEnrollmentsCanceled();
    wrapper.update();
    assert.isFalse(wrapper.state('isMoveEnrollmentsDialogOpen'));
  });

  it('move some enrollments', () => {
    const workshop = Factory.build('workshop');
    const enrollments = Factory.buildList('enrollment', 2);
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={enrollments}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );

    // Select the first enrollment
    wrapper.instance().handleClickSelect(enrollments[0]);
    wrapper.update();
    assert.deepEqual(
      [_.pick(enrollments[0], ['id', 'email', 'first_name', 'last_name'])],
      wrapper.state('selectedEnrollments')
    );

    // Open the move enrollments dialog
    wrapper.instance().handleClickMove();
    wrapper.update();
    assert.isTrue(wrapper.state('isMoveEnrollmentsDialogOpen'));

    // Confirm the move with a fake destination workshop
    const destinationWorkshopId = 5;
    wrapper.instance().handleMoveEnrollmentsConfirmed(destinationWorkshopId);
    wrapper.update();
    assert.isFalse(wrapper.state('isMoveEnrollmentsDialogOpen'));
    assert.deepEqual([], wrapper.state('selectedEnrollments'));

    // Respond to the server request
    server.respondWith(
      'POST',
      `/api/v1/pd/enrollments/move?destination_workshop_id=${destinationWorkshopId}&enrollment_ids[]=${
        enrollments[0].id
      }`,
      [204, {}, '']
    );
    server.respond();
    wrapper.update();
    assert(loadEnrollments.calledOnce);
  });

  it('delete an enrollment', () => {
    const workshop = Factory.build('workshop');
    const wrapper = shallow(
      <EnrollmentsPanel
        workshopId={String(workshop.id)}
        workshop={workshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );
    const enrollmentId = 1;
    server.respondWith(
      'DELETE',
      `/api/v1/pd/workshops/${workshop.id}/enrollments/${enrollmentId}`,
      [204, {}, '']
    );

    wrapper.instance().handleDeleteEnrollment(enrollmentId);
    server.respond();
    assert(loadEnrollments.calledOnce);
  });
});
