import React from 'react';
import {mount} from 'enzyme';
import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';
import {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

describe("PeerReviewSubmissions", () => {
  let server;
  let debounceStub;
  let peerReviewSubmissions;

  const fakePeerReviewData = [
    {
      submitter: 'User 1',
      course_name: 'Course 1',
      review_ids: [[1, 'accepted'], [2, 'accepted']]
    },
    {
      submitter: 'User 2',
      course_name: 'Course 2',
      review_ids: [[3, 'accepted'], [4, 'accepted']]
    }
  ];

  before(() => {
    // stub out debounce to return the original function, so it's called immediately
    debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);

    server = sinon.fakeServer.create();
    server.respondWith("GET", '/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=&plc_course_unit_id=',
      [200, { "Content-Type": "application/json" }, JSON.stringify(fakePeerReviewData)]
    );

    peerReviewSubmissions = mount(
      <PeerReviewSubmissions
        filterType="all"
        courseList={[['course_1', 1], ['course_2', 2]]}
        courseUnitMap={{
          1: [['course_1_unit_1', 10], ['course_1_unit_2', 11]],
          2: [['course_2_unit_1', 20], ['course_2_unit_2', 21]]
        }}
      />
    );
  });

  after(() => {
    debounceStub.restore();
    server.restore();
  });

  it("Initially renders course options and calls API for submissions", () => {
    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=&plc_course_unit_id=');

    server.respond();

    expect(peerReviewSubmissions.state()).to.deep.equal({
      loading: false,
      emailFilter: '',
      plcCourseId: '',
      plcCourseUnitId: '',
      submissions: fakePeerReviewData});
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;

    let courseOptions = peerReviewSubmissions.find('#PlcCourseSelect option').map((option) => {
      return [option.text(), option.prop('value')];
    });

    expect(courseOptions).to.deep.equal([['All Courses', ''], ['course_1', 1], ['course_2', 2]]);
    expect(peerReviewSubmissions.find('#PlcCourseUnitSelect').prop('disabled')).to.be.true;
  });

  it("Changing the course makes a new call and enables the button when a course is selected", () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: '1'}});
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=1&plc_course_unit_id=');
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('1');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;
    expect(peerReviewSubmissions.find('#PlcCourseUnitSelect').prop('disabled')).to.be.false;
    let courseUnitOptions = peerReviewSubmissions.find('#PlcCourseUnitSelect option').map((option => {
      return [option.text(), option.prop('value')];
    }));
    expect(courseUnitOptions).to.deep.equal([['All Course Units', ''], ['course_1_unit_1', 10], ['course_1_unit_2', 11]]);

    peerReviewSubmissions.find('#PlcCourseUnitSelect').simulate('change', {target: {value: '10'}});
    expect(server.requests[1].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=1&plc_course_unit_id=10');
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('1');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('10');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.false;

    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: ''}});
    expect(server.requests[2].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=&plc_course_unit_id=');
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;
    expect(peerReviewSubmissions.find('#PlcCourseUnitSelect').prop('disabled')).to.be.true;
  });

  it("Changing the email filter triggers a new call with email filter applied", () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions.find('#EmailFilter').simulate('change', {target: {value: 'someone@example.com'}});
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=someone@example.com&plc_course_id=&plc_course_unit_id=');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;
  });
});
