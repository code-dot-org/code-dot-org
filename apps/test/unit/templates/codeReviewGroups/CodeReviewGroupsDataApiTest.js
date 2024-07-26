import $ from 'jquery';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('CodeReviewGroupsDataApi', () => {
  const sectionId = 101;
  let serverGroupsResponse, clientGroupsList, postJSON, getJSON, api;

  beforeEach(() => {
    serverGroupsResponse = {
      groups: [
        {
          unassigned: true,
          members: [
            {follower_id: 1, name: 'student1'},
            {follower_id: 2, name: 'student2'},
          ],
        },
        {
          id: 1,
          name: 'group1',
          members: [{follower_id: 3, name: 'student3'}],
        },
      ],
    };
    clientGroupsList = [
      {
        unassigned: true,
        members: [
          {followerId: 1, name: 'student1'},
          {followerId: 2, name: 'student2'},
        ],
      },
      {
        id: 1,
        name: 'group1',
        members: [{followerId: 3, name: 'student3'}],
      },
    ];

    postJSON = sinon.stub();
    getJSON = sinon.stub($, 'getJSON');
    api = new CodeReviewGroupsDataApi(sectionId);
    api.postJSON = postJSON;
  });

  afterEach(() => {
    getJSON.restore();
  });

  it('makes a GET request and converts group data when calling getCodeReviewGroups', () => {
    let convertedResponse;

    getJSON.returns({
      then: callback => {
        convertedResponse = callback(serverGroupsResponse);
      },
    });
    api.getCodeReviewGroups();

    sinon.assert.calledWith(
      getJSON,
      `/api/v1/sections/${sectionId}/code_review_groups`
    );

    expect(clientGroupsList).to.deep.equal(convertedResponse);
  });

  it('makes a POST request with converted group data when calling setCodeReviewGroups', () => {
    api.setCodeReviewGroups(clientGroupsList);

    sinon.assert.calledWith(
      postJSON,
      `/api/v1/sections/${sectionId}/code_review_groups`
    );

    const data = postJSON.getCall(0).args[1];
    expect(serverGroupsResponse).to.deep.equal(data);
  });

  it('makes a POST request with enabled value when calling setCodeReviewEnabled', () => {
    api.setCodeReviewEnabled(true);

    sinon.assert.calledWith(
      postJSON,
      `/api/v1/sections/${sectionId}/code_review_enabled`,
      {enabled: true}
    );
  });
});
