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
    server.respondWith("GET", '/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=',
      [200, { "Content-Type": "application/json" }, JSON.stringify(fakePeerReviewData)]
    );

    peerReviewSubmissions = mount(
      <PeerReviewSubmissions
        filterType="all"
        courseList={[['course_1', 1], ['course_2', 2]]}
      />
    );
  });

  after(() => {
    debounceStub.restore();
    server.restore();
  });

  it("Initial creation of the control makes the expected call to server and renders course options", () => {
    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=');

    server.respond();

    expect(peerReviewSubmissions.state()).to.deep.equal({loading: false, submissions: fakePeerReviewData});
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;

    let options = peerReviewSubmissions.find('option').map((option) => {
      return [option.text(), option.prop('value')];
    });

    expect(options).to.deep.equal([['All Courses', ''], ['course_1', 1], ['course_2', 2]]);
  });

  it("Changing the course makes a new call and enables the button when a course is selected", () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: '1'}});
    expect(peerReviewSubmissions.state().plc_course_id).to.equal('1');
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=1');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.false;

    peerReviewSubmissions.find('#DownloadCsvReport').simulate('click');

    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: ''}});
    expect(peerReviewSubmissions.state().plc_course_id).to.equal('');
    expect(server.requests[1].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;
  });

  it("Changing the email filter triggers a new call with email filter applied", () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions.find('#EmailFilter').simulate('change', {target: {value: 'someone@example.com'}});
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=someone@example.com&plc_course_id=');
    expect(peerReviewSubmissions.find('#DownloadCsvReport').prop('disabled')).to.be.true;
  });
});
