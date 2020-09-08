import _ from 'lodash';
import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert} from 'chai';
import sinon from 'sinon';
import {Factory} from 'rosie';
import EnrollmentsPanel, {
  MOVE_ENROLLMENT_BUTTON_NAME,
  EDIT_ENROLLMENT_NAME_BUTTON_NAME
} from '@cdo/apps/code-studio/pd/workshop_dashboard/EnrollmentsPanel';
import './workshopFactory';

describe('EnrollmentsPanel', () => {
  let server, loadEnrollments;
  let sampleCSFWorkshop = {
    id: 123,
    state: 'Ended',
    subject: 'Intro',
    course: 'CS Fundamentals',
    'account_required_for_attendance?': false,
    capacity: 10,
    enrolled_teacher_count: 5,
    'scholarship_workshop?': false
  };

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
    assert(!wrapper.find('Spinner').exists(), 'Spinner was not rendered');
    assert(
      wrapper.find('WorkshopEnrollment').exists(),
      'WorkshopEnrollment was not rendered'
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
      'Move button was not rendered'
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

    wrapper.instance().handleEnrollmentRefresh();
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

    wrapper.instance().handleClickChangeEnrollments({
      target: {name: MOVE_ENROLLMENT_BUTTON_NAME}
    });
    wrapper.update();
    assert(
      wrapper.state('enrollmentChangeDialogOpen') ===
        MOVE_ENROLLMENT_BUTTON_NAME,
      'Move enrollments dialog was not opened'
    );

    wrapper.instance().handleChangeEnrollmentsCanceled();
    wrapper.update();
    assert(
      wrapper.state('enrollmentChangeDialogOpen') === null,
      'Move enrollments dialog was not closed'
    );
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
    wrapper.instance().handleClickChangeEnrollments({
      target: {name: MOVE_ENROLLMENT_BUTTON_NAME}
    });
    wrapper.update();
    assert(
      wrapper.state('enrollmentChangeDialogOpen') ===
        MOVE_ENROLLMENT_BUTTON_NAME
    );

    // Confirm the move with a fake destination workshop
    const destinationWorkshopId = 5;
    wrapper.instance().handleMoveEnrollmentsConfirmed(destinationWorkshopId);
    wrapper.update();
    assert(wrapper.state('enrollmentChangeDialogOpen') === null);
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

  it('edit an enrollment', () => {
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

    wrapper.instance().handleClickChangeEnrollments({
      target: {name: EDIT_ENROLLMENT_NAME_BUTTON_NAME}
    });
    wrapper.update();
    assert(
      wrapper.state('enrollmentChangeDialogOpen') ===
        EDIT_ENROLLMENT_NAME_BUTTON_NAME
    );

    // Confirm the updated name
    const updatedName = {firstName: 'Rubeus', lastName: 'Hagrid'};
    wrapper.instance().handleEditEnrollmentConfirmed(updatedName);
    wrapper.update();
    assert(wrapper.state('enrollmentChangeDialogOpen') === null);
    assert.deepEqual([], wrapper.state('selectedEnrollments'));

    // Respond to the server request
    server.respondWith(
      'POST',
      `/api/v1/pd/enrollment/${enrollments[0].id}/edit`,
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

  it('should show survey results button for CSF Intro past May 2020', () => {
    sampleCSFWorkshop.sessions = [
      {start: '2020-05-08T09:00:00.000Z', end: '2020-05-08T17:00:00.000Z'}
    ];

    const wrapper = mount(
      <EnrollmentsPanel
        workshopId={String(sampleCSFWorkshop.id)}
        workshop={sampleCSFWorkshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );

    assert(
      wrapper
        .find('Button')
        .filterWhere(n => n.text().includes('View Survey Results'))
        .exists(),
      'View Survey Results button was rendered'
    );
  });

  it('should not show survey results button for CSF Intro pre May 2020', () => {
    sampleCSFWorkshop.sessions = [
      {start: '2020-04-08T09:00:00.000Z', end: '2020-04-08T17:00:00.000Z'}
    ];
    const wrapper = mount(
      <EnrollmentsPanel
        workshopId={String(sampleCSFWorkshop.id)}
        workshop={sampleCSFWorkshop}
        isLoadingEnrollments={false}
        enrollments={[]}
        isWorkshopAdmin
        loadEnrollments={loadEnrollments}
      />
    );

    assert(
      !wrapper
        .find('Button')
        .filterWhere(n => n.text().includes('View Survey Results'))
        .exists(),
      'View Survey Results button was not rendered'
    );
  });
});
