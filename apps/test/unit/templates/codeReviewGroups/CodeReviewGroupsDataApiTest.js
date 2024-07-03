import $ from 'jquery';

import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';



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

    postJSON = jest.fn();
    getJSON = jest.spyOn($, 'getJSON').mockClear().mockImplementation();
    api = new CodeReviewGroupsDataApi(sectionId);
    api.postJSON = postJSON;
  });

  afterEach(() => {
    getJSON.mockRestore();
  });

  it('makes a GET request and converts group data when calling getCodeReviewGroups', () => {
    let convertedResponse;

    getJSON.mockReturnValue({
      then: callback => {
        convertedResponse = callback(serverGroupsResponse);
      },
    });
    api.getCodeReviewGroups();

    expect(getJSON).toHaveBeenCalledWith(`/api/v1/sections/${sectionId}/code_review_groups`);

    expect(clientGroupsList).toEqual(convertedResponse);
  });

  it('makes a POST request with converted group data when calling setCodeReviewGroups', () => {
    api.setCodeReviewGroups(clientGroupsList);

    expect(postJSON).toHaveBeenCalledWith(`/api/v1/sections/${sectionId}/code_review_groups`);

    const data = postJSON.mock.calls[0][1];
    expect(serverGroupsResponse).toEqual(data);
  });

  it('makes a POST request with enabled value when calling setCodeReviewEnabled', () => {
    api.setCodeReviewEnabled(true);

    expect(postJSON).toHaveBeenCalledWith(`/api/v1/sections/${sectionId}/code_review_enabled`, {enabled: true});
  });
});
