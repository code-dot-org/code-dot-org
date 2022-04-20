import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({programmingEnvironment}) {
  const [documentation, setDocumentation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!programmingEnvironment) {
      setLoadError(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(false);
    $.ajax({
      url: `/programming_environments/${programmingEnvironment}/get_summary_by_name`,
      method: 'GET'
    })
      .done(data => {
        setDocumentation(data);
        setIsLoading(false);
      })
      .fail(() => {
        setIsLoading(false);
        setLoadError(true);
        setDocumentation(null);
      });
  }, [programmingEnvironment]);

  return (
    <div>
      {isLoading && <Spinner />}
      {loadError && <p>Could not load documentation.</p>}
      {!isLoading && documentation && <p>Found documentation!</p>}
    </div>
  );
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string
};

export default connect(state => ({
  programmingEnvironment: state.instructions.programmingEnvironment
}))(UnconnectedDocumentationTab);
