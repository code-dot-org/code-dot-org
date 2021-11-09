import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';
import CodeReviewGroupsManager from './CodeReviewGroupsManager';
import LoadableComponent from '../LoadableComponent';

export default function CodeReviewGroupsLoader({sectionId}) {
  return (
    <LoadableComponent
      loadFunction={(sectionId, onLoadSuccess, onLoadError) => {
        const api = new CodeReviewGroupsDataApi(sectionId);
        api
          .getCodeReviewGroups()
          .then(groups => onLoadSuccess([convertGroupData(groups)]))
          .fail(error => onLoadError());
      }}
      loadArgs={[sectionId]}
      renderFunction={groups => (
        <CodeReviewGroupsManager initialGroups={groups} />
      )}
    />
  );
}

/**
 * Converts code review groups JSON data from the server by performing
 * any necessary JSON key conversions from snake case to camel case
 */
function convertGroupData(groups) {
  for (let group of groups) {
    group.members = group.members.map(member => {
      let converted = {...member, followerId: member.follower_id};
      delete converted.follower_id;
      return converted;
    });
  }
  return groups;
}

CodeReviewGroupsLoader.propTypes = {
  /** Required. The section ID the Code Review Groups belong to */
  sectionId: PropTypes.number.isRequired
};
