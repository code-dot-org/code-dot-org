import React from 'react';
import ProgressStageContent from './ProgressStageContent';
import FontAwesome from '../FontAwesome';

const styles = {
  main: {
    background: '#F6F6F6',
    border: '1px solid #BBBBBB',
    borderRadius: 2,
    padding: 20
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
  render() {
    return (
      <div style={styles.main}>
        <div style={styles.heading}>
          <FontAwesome icon="caret-down"/>
          <span style={styles.headingText}>Stage 4: Encoding Color Images</span>
        </div>
        <ProgressStageContent/>
      </div>
    );
  }
});

export default ProgressStage;
