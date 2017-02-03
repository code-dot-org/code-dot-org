import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { categorizedLessons } from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import ProgressGroup from './ProgressGroup';
import { levelType } from './progressTypes';

const ProgressTable = React.createClass({
  propTypes: {
    isSummaryView: PropTypes.bool.isRequired,
    categorizedLessons: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
        levels: PropTypes.arrayOf(
          PropTypes.arrayOf(levelType)
        ).isRequired
      })
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
    const { isSummaryView, categorizedLessons } = this.props;

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;

    if (categorizedLessons.length === 1) {
      return (
        <TableType
          lessonNames={categorizedLessons[0].lessonNames}
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
              lessonNames={category.lessonNames}
              levelsByLesson={category.levels}
            />
          ))}
        </div>
      );
    }
  }
});

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  categorizedLessons: categorizedLessons(state.progress)
}))(ProgressTable);
