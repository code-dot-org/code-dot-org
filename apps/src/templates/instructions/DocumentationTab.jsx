import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

/**
 * This is a placeholder for the upcoming "Documentation" tab in Javalab.
 * See related task: https://codedotorg.atlassian.net/browse/CSA-361
 */
const UnconnectedDocumentationTab = function({programmingEnvironment}) {
  return <p>Documentation for {programmingEnvironment}</p>;
};

UnconnectedDocumentationTab.propTypes = {
  programmingEnvironment: PropTypes.string
};

export default connect(state => ({
  programmingEnvironment: state.instructions.programmingEnvironment
}))(UnconnectedDocumentationTab);
