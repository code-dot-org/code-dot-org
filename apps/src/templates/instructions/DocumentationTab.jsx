import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({documentationCategory}) {
  return <p>Documentation for {documentationCategory}</p>;
};

UnconnectedDocumentationTab.propTypes = {
  documentationCategory: PropTypes.string
};

export default connect(state => ({
  documentationCategory: state.instructions.documentationCategory
}))(UnconnectedDocumentationTab);
