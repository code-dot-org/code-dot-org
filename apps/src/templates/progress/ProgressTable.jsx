import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { lessonNames, levelsByStage } from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';

const ProgressTable = React.createClass({
  propTypes: {
    isSummaryView: PropTypes.bool.isRequired,
    lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    levelsByStage: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          level: PropTypes.string,
          url: PropTypes.string
        })
      )
    ).isRequired,
  },
  componentDidMount() {
    // TODO - This modifies things outside of our scope. This is done right now
    // because we only want to modify this (dashboard-owned) markup in the case
    // where an experiment is enabled (leading to this component being rendered).
    // Once we're not behind an experiment, we should make these changes elsewhere.
    const padding = 80;
    $(".container.main").css({
      width: 'initial',
      maxWidth: 940 + 2 * padding,
      paddingLeft: padding,
      paddingRight:padding
    });
  },

  render() {
    if (this.props.isSummaryView) {
      return (
        <SummaryProgressTable
          lessonNames={this.props.lessonNames}
          levelsByStage={this.props.levelsByStage}
        />
      );
    } else {
      return (
        <DetailProgressTable
          lessonNames={this.props.lessonNames}
          levelsByStage={this.props.levelsByStage}
        />
      );
    }
  }
});

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  lessonNames: lessonNames(state.progress),
  levelsByStage: levelsByStage(state.progress),
}))(ProgressTable);
