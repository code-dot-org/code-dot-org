import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({documentationEnvironment}) {
  const [documentation, setDocumentation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validDocumentationEnvironment, setValidDocumentationEnvironment] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (!documentationEnvironment) {
      setValidDocumentationEnvironment(false);
      setIsLoading(false);
      return;
    }
    $.ajax({
      url: `/programming_environments/get_summary_by_name/${documentationEnvironment}`,
      method: 'GET',
    }).done((data, _, request) => {
      // TODO: fill in
    });
  }, [documentationEnvironment]);

  return <p>Documentation for {documentationEnvironment}</p>;
};

UnconnectedDocumentationTab.propTypes = {
  documentationEnvironment: PropTypes.string
};

export default connect(state => ({
  documentationEnvironment: state.instructions.documentationEnvironment
}))(UnconnectedDocumentationTab);
