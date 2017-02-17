import React, { PropTypes } from 'react';
import Radium from 'radium';
import DetailProgressTable from './DetailProgressTable';
import SummaryProgressTable from './SummaryProgressTable';
import FontAwesome from '../FontAwesome';
import { levelType } from './progressTypes';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: color.purple,
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
    color: 'white',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headingText: {
    marginLeft: 10
  },
  contents: {
    backgroundColor: color.lighter_purple,
    padding: 20
  },
  bottom: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
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

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;
    const icon = this.state.collapsed ? "caret-right" : "caret-down";

    return (
      <div style={styles.main}>
        <div
          style={[styles.header, this.state.collapsed && styles.bottom]}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>
            {groupName}
          </span>
        </div>
        {!this.state.collapsed &&
          <div style={[styles.contents, styles.bottom]}>
            <TableType
              lessonNames={lessonNames}
              levelsByLesson={levelsByLesson}
            />
          </div>
        }
      </div>
    );
  }
});

export default Radium(ProgressGroup);
