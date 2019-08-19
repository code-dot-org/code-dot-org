import React from 'react';
import {mount} from 'enzyme';
import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';
import {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

describe('PeerReviewSubmissions', () => {
  let server;
  let debounceStub;
  let peerReviewSubmissions;

  const fakePeerReviewData = {
    submissions: [
      {
        submitter: 'User 1',
        course_name: 'Course 1',
        review_ids: [
          [1, 'accepted', '2019-03-05T01:11:50Z'],
          [2, 'accepted', '2019-03-05T01:11:50Z']
        ]
      },
      {
        submitter: 'User 2',
        course_name: 'Course 2',
        review_ids: [
          [3, 'accepted', '2019-03-05T01:11:50Z'],
          [4, 'accepted', '2019-03-05T01:11:50Z']
        ]
      }
    ],
    pagination: {
      total_results: 2,
      total_pages: 1,
      current_page: 1,
      next_page: null,
      prev_page: null
    }
  };

  before(() => {
    // stub out debounce to return the original function, so it's called immediately
    debounceStub = sinon.stub(_, 'debounce').callsFake(f => f);

    server = sinon.fakeServer.create();
    server.respondWith(
      'GET',
      '/api/v1/peer_review_submissions/index?user_q=&plc_course_id=&plc_course_unit_id=&page=1&per=30',
      [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(fakePeerReviewData)
      ]
    );

    peerReviewSubmissions = mount(
      <PeerReviewSubmissions
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

  it('Initially renders course options and calls API for submissions', () => {
    expect(server.requests.length).to.equal(1);
    expect(server.requests[0].url).to.equal(
      '/api/v1/peer_review_submissions/index?user_q=&plc_course_id=&plc_course_unit_id=&page=1&per=30'
    );

    server.respond();

    expect(peerReviewSubmissions.state()).to.deep.equal({
      loading: false,
      userFilter: '',
      plcCourseId: '',
      plcCourseUnitId: '',
      submissions: fakePeerReviewData.submissions,
      pagination: fakePeerReviewData.pagination
    });
    expect(
      peerReviewSubmissions.find('button#DownloadCsvReport').prop('disabled')
    ).to.be.true;

    let courseOptions = peerReviewSubmissions
      .find('#PlcCourseSelect option')
      .map(option => {
        return [option.text(), option.prop('value')];
      });

    expect(courseOptions).to.deep.equal([
      ['All Courses', ''],
      ['course_1', 1],
      ['course_2', 2]
    ]);
    expect(
      peerReviewSubmissions.find('select#PlcCourseUnitSelect').prop('disabled')
    ).to.be.true;
  });

  it('Changing the course makes a new call and enables the button when a course is selected', () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions
      .find('select#PlcCourseSelect')
      .simulate('change', {target: {value: '1'}});
    expect(server.requests[0].url).to.equal(
      '/api/v1/peer_review_submissions/index?user_q=&plc_course_id=1&plc_course_unit_id=&page=1&per=30'
    );
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('1');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('');
    expect(
      peerReviewSubmissions.find('button#DownloadCsvReport').prop('disabled')
    ).to.be.true;
    expect(
      peerReviewSubmissions.find('select#PlcCourseUnitSelect').prop('disabled')
    ).to.be.false;
    let courseUnitOptions = peerReviewSubmissions
      .find('#PlcCourseUnitSelect option')
      .map(option => {
        return [option.text(), option.prop('value')];
      });
    expect(courseUnitOptions).to.deep.equal([
      ['All Course Units', ''],
      ['course_1_unit_1', 10],
      ['course_1_unit_2', 11]
    ]);

    peerReviewSubmissions
      .find('select#PlcCourseUnitSelect')
      .simulate('change', {target: {value: '10'}});
    expect(server.requests[1].url).to.equal(
      '/api/v1/peer_review_submissions/index?user_q=&plc_course_id=1&plc_course_unit_id=10&page=1&per=30'
    );
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('1');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('10');
    expect(
      peerReviewSubmissions.find('button#DownloadCsvReport').prop('disabled')
    ).to.be.false;

    peerReviewSubmissions
      .find('select#PlcCourseSelect')
      .simulate('change', {target: {value: ''}});
    expect(server.requests[2].url).to.equal(
      '/api/v1/peer_review_submissions/index?user_q=&plc_course_id=&plc_course_unit_id=&page=1&per=30'
    );
    expect(peerReviewSubmissions.state().plcCourseId).to.equal('');
    expect(peerReviewSubmissions.state().plcCourseUnitId).to.equal('');
    expect(
      peerReviewSubmissions.find('button#DownloadCsvReport').prop('disabled')
    ).to.be.true;
    expect(
      peerReviewSubmissions.find('select#PlcCourseUnitSelect').prop('disabled')
    ).to.be.true;
  });

  it('Changing the email filter triggers a new call with email filter applied', () => {
    server = sinon.fakeServer.create();

    peerReviewSubmissions
      .find('input#NameEmailFilter')
      .simulate('change', {target: {value: 'someone@example.com'}});
    expect(server.requests[0].url).to.equal(
      '/api/v1/peer_review_submissions/index?user_q=someone@example.com&plc_course_id=&plc_course_unit_id=&page=1&per=30'
    );
    expect(
      peerReviewSubmissions.find('button#DownloadCsvReport').prop('disabled')
    ).to.be.true;
  });
});
