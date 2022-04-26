import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {useFetch} from '@cdo/apps/util/useFetch';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({programmingEnvironment}) {
  const {loading, data, error} = useFetch(
    `/programming_environments/${programmingEnvironment}/get_summary_by_name`,
    null,
    [programmingEnvironment]
  );

  return (
    <div>
      {loading && <Spinner />}
      {error && <p>Could not load documentation.</p>}
      {!loading && data && (
        <p>{`Found documentation! Found ${data.length} categories.`}</p>
      )}
    </div>
  );
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string
};

export default connect(state => ({
  programmingEnvironment: state.instructions.programmingEnvironment
}))(UnconnectedDocumentationTab);
