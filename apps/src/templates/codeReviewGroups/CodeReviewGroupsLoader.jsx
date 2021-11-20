import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewGroupsDataApi from './CodeReviewGroupsDataApi';
import CodeReviewGroupsManager from './CodeReviewGroupsManager';
import LoadableComponent from '../LoadableComponent';

export default function CodeReviewGroupsLoader({sectionId, groups, setGroups}) {
  return (
    <LoadableComponent
      loadFunction={(sectionId, onLoadSuccess, onLoadError) => {
        console.log('in load function');
        const api = new CodeReviewGroupsDataApi(sectionId);
        api
          .getCodeReviewGroups()
          .then(groups => {
            // are we sure this will set state before first render?
            // we might be able to call onLoadSuccess as a callback after setGroups,
            // but the approach is slightly complicated because useState does not support
            // an explicit callback.
            // might be straightforward enough to just do ourselves, and I'm not sure how well supported this is,
            // but here's something out of the box:
            // https://github.com/the-road-to-learn-react/use-state-with-callback
            // https://github.com/the-road-to-learn-react/use-state-with-callback/blob/master/src/index.js
            setGroups(groups);
            onLoadSuccess([groups]);
          })
          .fail(error => onLoadError());
      }}
      loadArgs={[sectionId]}
      renderFunction={_ => {
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
