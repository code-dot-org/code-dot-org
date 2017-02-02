import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import i18n from '@cdo/locale';
import { lessonNames, categories, levelsByLesson } from '@cdo/apps/code-studio/progressRedux';
import SummaryProgressTable from './SummaryProgressTable';
import DetailProgressTable from './DetailProgressTable';
import ProgressGroup from './ProgressGroup';

function categorize(categories, lessonNames, levelsByLesson) {
  let byCategory = {};

  categories.forEach((category, index) => {
    const lessonName = lessonNames[index];
    const levels = levelsByLesson[index];

    byCategory[category] = byCategory[category] || {
      category,
      lessonNames: [],
      levels: []
    };

    byCategory[category].lessonNames.push(lessonName);
    byCategory[category].levels.push(levels);
  });

  return byCategory;
}

const ProgressTable = React.createClass({
  propTypes: {
    isSummaryView: PropTypes.bool.isRequired,
    lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    levelsByLesson: PropTypes.arrayOf(
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
    const { isSummaryView, categories, lessonNames, levelsByLesson } = this.props;

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;

    if (_.uniq(categories).length === 1) {
      return (
        <TableType
          lessonNames={lessonNames}
          levelsByLesson={levelsByLesson}
        />
      );
    } else {
      const categorized = categorize(categories, lessonNames, levelsByLesson);
      return (
        <div>
          {Object.keys(categorized).map((category, index) => (
            <ProgressGroup
              key={index}
              groupName={category}
              isSummaryView={isSummaryView}
              lessonNames={categorized[category].lessonNames}
              levelsByLesson={categorized[category].levels}
            />
          ))}
        </div>
      );
    }
  }
});

export default connect(state => ({
  isSummaryView: state.progress.isSummaryView,
  lessonNames: lessonNames(state.progress),
  // Put anything without a category into a "Content" category
  categories: categories(state.progress).map(cat => cat || i18n.content()),
  levelsByLesson: levelsByLesson(state.progress),
}))(ProgressTable);
