// import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

function CodeReviewGroupsStatusToggle({codeReviewExpiresAt}) {
  return;
}

CodeReviewGroupsStatusToggle.propTypes = {
  codeReviewExpiresAt: PropTypes.number
};

export default connect(state => ({
  codeReviewExpiresAt: state.sectionData.section.codeReviewExpiresAt
}))(CodeReviewGroupsStatusToggle);
