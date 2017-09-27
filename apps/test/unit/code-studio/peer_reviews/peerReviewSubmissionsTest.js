import React from 'react';
import {mount} from 'enzyme';
import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';
import {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

describe("", () => {
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

    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=');

    server.respond();
  });

  after(() => {
    debounceStub.restore();
    server.restore();
  });

  beforeEach(() => {
    server = sinon.fakeServer.create();
  });

  it("Initial call", () => {
    expect(peerReviewSubmissions.state()).to.deep.equal({submissions: fakePeerReviewData});
    expect(peerReviewSubmissions.find('Button').prop('disabled')).to.be.true;

    let options = peerReviewSubmissions.find('option').map((option) => {
      return [option.text(), option.prop('value')];
    });

    expect(options).to.deep.equal([['All Courses', ''], ['course_1', 1], ['course_2', 2]]);
  });

  it("Changing the course triggers a new call, and enables the button", () => {
    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: '1'}});
    expect(peerReviewSubmissions.state().plc_course_id).to.equal('1');
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=1');
    expect(peerReviewSubmissions.find('Button').prop('disabled')).to.be.false;

    peerReviewSubmissions.find('Button').simulate('click');

    peerReviewSubmissions.find('#PlcCourseSelect').simulate('change', {target: {value: ''}});
    expect(peerReviewSubmissions.state().plc_course_id).to.equal('');
    expect(server.requests[1].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=&plc_course_id=');
    expect(peerReviewSubmissions.find('Button').prop('disabled')).to.be.true;
  });

  it("Changing the email filter triggers a new call", () => {
    peerReviewSubmissions.find('#EmailFilter').simulate('change', {target: {value: 'someone@example.com'}});
    expect(peerReviewSubmissions.state().email_filter).to.equal('someone@example.com');
    expect(server.requests[0].url).to.equal('/api/v1/peer_review_submissions/index?filter=all&email=someone@example.com&plc_course_id=');
    expect(peerReviewSubmissions.find('Button').prop('disabled')).to.be.true;
  });
});
