import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { categorizedLessons, peerReviewLesson, peerReviewLevels } from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import ProgressGroup from './ProgressGroup';
import { levelType, lessonType } from './progressTypes';

const ProgressTable = React.createClass({
  propTypes: {
    isSummaryView: PropTypes.bool.isRequired,
    categorizedLessons: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        lessons: PropTypes.arrayOf(lessonType).isRequired,
        levels: PropTypes.arrayOf(
          PropTypes.arrayOf(levelType)
        ).isRequired
      })
    ).isRequired,
    // TODO - can i ultimate just give these their own category?
    peerReviewLesson: lessonType,
    peerReviewLevels: PropTypes.arrayOf(levelType)
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
    const { isSummaryView, categorizedLessons, peerReviewLesson, peerReviewLevels } = this.props;

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;

    if (categorizedLessons.length === 1) {
      return (
        <TableType
          lessons={categorizedLessons[0].lessons}
          levelsByLesson={categorizedLessons[0].levels}
        />
      );
    } else {
      return (
        <div>
          {categorizedLessons.map(category => (
            <ProgressGroup
              key={category.category}
              groupName={category.category}
              isSummaryView={isSummaryView}
              lessons={category.lessons}
              levelsByLesson={category.levels}
            />
          ))}
          {/* Peer reviews are a bit of a special beast and will take some time to
            * get right. For now, stick in a placeholder that makes it clear that
            * this work hasnt been done yet*/}
          {!!peerReviewLesson &&
            <ProgressGroup
              key="peer_review"
              groupName={"Peer Review"}
              isSummaryView={isSummaryView}
              lessons={[peerReviewLesson]}
              levelsByLesson={[peerReviewLevels]}
            />
          }
        </div>
      );
    }
  }
});

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  categorizedLessons: categorizedLessons(state.progress),
  peerReviewLesson: peerReviewLesson(state.progress),
  peerReviewLevels: peerReviewLevels(state.progress)
}))(ProgressTable);
