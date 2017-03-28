import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import CourseProgress from './CourseProgress';

/**
 * The course progress dropdown you get when you click the arrow in the header.
 */
const MiniView = React.createClass({
  propTypes: {
    hasFullProgress: PropTypes.bool.isRequired
  },

  render() {
    const { hasFullProgress } = this.props;

    if (!hasFullProgress) {
      // Ideally we would specify inline CSS instead of using a classname here,
      // but the image used here gets digested by rails, and we don't know the
      // digested path
      return <div className="loading"/>;
    }

    return (
      <CourseProgress onOverviewPage={false}/>
    );
  }
});

export default connect(state => ({
  hasFullProgress: state.progress.hasFullProgress,
}))(MiniView);
