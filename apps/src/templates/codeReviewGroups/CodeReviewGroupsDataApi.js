import $ from 'jquery';

export default class CodeReviewGroupsDataApi {
  constructor(sectionId) {
    this.sectionId = sectionId;
  }

  getCodeReviewGroups() {
    return $.getJSON(
      `/api/v1/sections/${this.sectionId}/code_review_groups`
    ).then(response => this.convertGroupsToCamelCase(response.groups));
  }

  setCodeReviewGroups(groups) {
    return $.post(`/api/v1/sections/${this.sectionId}/code_review_groups`, {
      groups: this.convertGroupsToSnakeCase(groups)
    });
  }

  setCodeReviewEnabled(enabled) {
    return $.post(`/api/v1/sections/${this.sectionId}/code_review_enabled`, {
      enabled
    });
  }

  /**
   * Converts code review groups JSON data from the server by performing
   * any necessary JSON key conversions from snake case to camel case
   */
  convertGroupsToCamelCase = groups => {
    for (let group of groups) {
      group.members = group.members.map(member => {
        let converted = {...member, followerId: member.follower_id};
        delete converted.follower_id;
        return converted;
      });
    }
    return groups;
  };

  /**
   * Converts code review groups data from the client into server-friendly
   * snake case
   */
  convertGroupsToSnakeCase = groups => {
    for (let group of groups) {
      group.members = group.members.map(member => {
        let converted = {...member, follower_id: member.followerId};
        delete converted.followerId;
        return converted;
      });
    }
    return groups;
  };
}
