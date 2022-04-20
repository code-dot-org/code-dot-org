import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({programmingEnvironment}) {
  // const [documentation, setDocumentation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validDocumentationEnvironment, setValidDocumentationEnvironment] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (!programmingEnvironment) {
      setValidDocumentationEnvironment(false);
      setIsLoading(false);
      return;
    }
    $.ajax({
      url: `/programming_environments/get_summary_by_name/${programmingEnvironment}`,
      method: 'GET'
    }).done((data, _, request) => {
      // TODO: fill in
    });
  }, [programmingEnvironment]);

  return <p>Documentation for {programmingEnvironment}</p>;
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string
};

export default connect(state => ({
  programmingEnvironment: state.instructions.programmingEnvironment
}))(UnconnectedDocumentationTab);
