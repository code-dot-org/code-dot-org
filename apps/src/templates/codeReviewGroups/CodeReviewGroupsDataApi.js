import $ from 'jquery';

export default class CodeReviewGroupsDataApi {
  constructor(sectionId) {
    this.sectionId = sectionId;
  }

  getCodeReviewGroups() {
    return $.getJSON(
      `/api/v1/sections/${this.sectionId}/code_review_groups`
    ).then(response => response.groups);
  }
}
