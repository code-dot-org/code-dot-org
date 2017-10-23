import React, { PropTypes } from 'react';
import Radium from 'radium';
import DetailProgressTable from './DetailProgressTable';
import SummaryProgressTable from './SummaryProgressTable';
import FontAwesome from '../FontAwesome';
import { levelType, lessonType } from './progressTypes';
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
    cursor: 'pointer'
  },
  headerBlue: {
    backgroundColor: color.cyan,
  },
  headingText: {
    marginLeft: 10
  },
  contents: {
    backgroundColor: color.lighter_purple,
    padding: 20,
  },
  contentsBlue: {
    backgroundColor: color.lightest_cyan,
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
export default Radium(class ProgressGroup extends React.Component {
  static propTypes = {
    groupName: PropTypes.string.isRequired,
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,
    isPlc: PropTypes.bool.isRequired,
    isSummaryView: PropTypes.bool.isRequired
  };

  state = {
    collapsed: false
  };

  toggleCollapsed = () => this.setState({
    collapsed: !this.state.collapsed
  });

  render() {
    const { groupName, lessons, levelsByLesson, isSummaryView, isPlc } = this.props;

    const TableType = isSummaryView ? SummaryProgressTable : DetailProgressTable;
    const icon = this.state.collapsed ? "caret-right" : "caret-down";

    return (
      <div style={styles.main}>
        <div
          style={[
            styles.header,
            isPlc && styles.headerBlue,
            this.state.collapsed && styles.bottom
          ]}
          onClick={this.toggleCollapsed}
        >
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>
            {groupName}
          </span>
        </div>
        {!this.state.collapsed &&
          <div
            style={[
              styles.contents,
              isPlc && styles.contentsBlue,
              styles.bottom
            ]}
          >
            <TableType
              lessons={lessons}
              levelsByLesson={levelsByLesson}
            />
          </div>
        }
      </div>
    );
  }
});
