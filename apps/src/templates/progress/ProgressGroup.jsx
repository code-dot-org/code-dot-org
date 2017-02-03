import React, { PropTypes } from 'react';
import DetailProgressTable from './DetailProgressTable';
import SummaryProgressTable from './SummaryProgressTable';
import FontAwesome from '../FontAwesome';
import { levelType } from './progressTypes';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    marginBottom: 20
  },
  header: {
    padding: 20,
    backgroundColor: color.purple,
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'white'
  },
  headingText: {
    marginLeft: 10
  },
  contents: {
    backgroundColor: color.lighter_purple,
    padding: 20
  }
};

/**
 * A component that shows a group of lessons. That group has a name and is
 * collapsible. It can show the lessons in either a detail or a summary view.
 */
const ProgressGroup = React.createClass({
  propTypes: {
    groupName: PropTypes.string.isRequired,
    lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,
    isSummaryView: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      collapsed: false
    };
  },

  toggleCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  },

  render() {
    const { groupName, lessonNames, levelsByLesson, isSummaryView } = this.props;

    const ProgressTable = isSummaryView ? SummaryProgressTable : DetailProgressTable;
    const icon = this.state.collapsed ? "caret-right" : "caret-down";

    return (
      <div style={styles.main}>
        <div
          style={styles.header}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>
            {groupName}
          </span>
        </div>
        {!this.state.collapsed &&
          <div style={styles.contents}>
            <ProgressTable
              lessonNames={lessonNames}
              levelsByLesson={levelsByLesson}
            />
          </div>
        }
      </div>
    );
  }
});

export default ProgressGroup;
