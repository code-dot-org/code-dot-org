import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({documentationEnvironment}) {
  return <p>Documentation for {documentationEnvironment}</p>;
};

UnconnectedDocumentationTab.propTypes = {
  documentationEnvironment: PropTypes.string
};

export default connect(state => ({
  documentationEnvironment: state.instructions.documentationEnvironment
}))(UnconnectedDocumentationTab);
