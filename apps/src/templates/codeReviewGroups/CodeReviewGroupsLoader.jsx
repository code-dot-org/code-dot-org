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
          .then(groups => onLoadSuccess([groups]))
          .fail(error => onLoadError());
      }}
      loadArgs={[sectionId]}
      renderFunction={groups => (
        <CodeReviewGroupsManager initialGroups={groups} />
      )}
    />
  );
}

CodeReviewGroupsLoader.propTypes = {
  /** Required. The section ID the Code Review Groups belong to */
  sectionId: PropTypes.number.isRequired
};
