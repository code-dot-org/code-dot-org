import React, { PropTypes } from 'react';
import ProgressStageContent from './ProgressStageContent';
import FontAwesome from '../FontAwesome';
import color from "@cdo/apps/util/color";
import { lessonType } from './progressTypes';

const styles = {
  main: {
    background: color.lightest_gray,
    border: '1px solid ' + color.border_gray,
    borderRadius: 2,
    padding: 20,
    marginBottom: 12
  },
  heading: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  headingText: {
    marginLeft: 10
  }
};

// TODO - everywhere stage = lesson, step = lesson
const ProgressStage = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    levels: PropTypes.arrayOf(lessonType).isRequired
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
    const { title, description, levels } = this.props;
    const icon = this.state.collapsed ? "caret-right" : "caret-down";
    return (
      <div style={styles.main}>
        <div style={styles.heading} onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>{title}</span>
        </div>
        {!this.state.collapsed &&
          <ProgressStageContent
            description={description}
            levels={levels}
          />
        }
      </div>
    );
  }
});

export default ProgressStage;
