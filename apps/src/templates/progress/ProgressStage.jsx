import React from 'react';
import ProgressStageContent from './ProgressStageContent';
import FontAwesome from '../FontAwesome';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    background: color.lightest_gray,
    border: '1px solid ' + color.border_gray,
    borderRadius: 2,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontFamily: '"Gotham 5r", sans-serif',
  },
  headingText: {
    marginLeft: 10
  }
};


// TODO - collapsing
const ProgressStage = React.createClass({
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
    const icon = this.state.collapsed ? "caret-right" : "caret-down";
    return (
      <div style={styles.main}>
        <div style={styles.heading} onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon}/>
          <span style={styles.headingText}>Stage 4: Encoding Color Images</span>
        </div>
        {!this.state.collapsed && <ProgressStageContent/>}
      </div>
    );
  }
});

export default ProgressStage;
