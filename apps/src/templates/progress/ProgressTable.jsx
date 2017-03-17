import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { categorizedLessons } from '@cdo/apps/code-studio/progressRedux';
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
    hasPeerReviews: PropTypes.bool.isRequired
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
    const { isSummaryView, categorizedLessons, hasPeerReviews } = this.props;

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
          {hasPeerReviews &&
            <ProgressGroup
              key="peer_review"
              groupName={"Peer Review: Not Yet Implemented with progressRedesign"}
              isSummaryView={isSummaryView}
              lessons={[
                {
                  name: "Not yet implemented",
                  id: -1
                }
              ]}
              levelsByLesson={[[{
                status: 'not_tried',
                url: '',
                name: 'Not Implemented'
              }]]}
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
  hasPeerReviews: !!state.progress.peerReviewStage,
}))(ProgressTable);
