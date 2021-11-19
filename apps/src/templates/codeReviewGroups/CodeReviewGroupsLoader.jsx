import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';
import CodeReviewGroupsManager from './CodeReviewGroupsManager';
import LoadableComponent from '../LoadableComponent';

export default function CodeReviewGroupsLoader({sectionId, groups, setGroups}) {
  return (
    <LoadableComponent
      loadFunction={(sectionId, onLoadSuccess, onLoadError) => {
        const api = new CodeReviewGroupsDataApi(sectionId);
        api
          .getCodeReviewGroups()
          .then(groups => {
            // are we sure this will set state before first render?
            setGroups(groups);
            onLoadSuccess([groups]);
          })
          .fail(error => onLoadError());
      }}
      loadArgs={[sectionId]}
      renderFunction={g => {
        return (
          <CodeReviewGroupsManager groups={groups} setGroups={setGroups} />
        );
      }}
    />
  );
}

CodeReviewGroupsLoader.propTypes = {
  /** Required. The section ID the Code Review Groups belong to */
  sectionId: PropTypes.number.isRequired,
  groups: PropTypes.array.isRequired,
  setGroups: PropTypes.func.isRequired
};
