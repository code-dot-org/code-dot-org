import React, { PropTypes } from 'react';
import ProgressStageStep from './ProgressStageStep';

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
  }
};

const ProgressStageContent = React.createClass({
  propTypes: {
    description: PropTypes.string
  },

  render() {
    const { description } = this.props;
    return (
      <div>
        <div style={styles.summary}>
          {description}
        </div>
        <ProgressStageStep
          start={1}
          name="Images, Pixels, and RGB"
          levels={[
            {
              status: 'perfect',
              url: '/foo/level1',
            }
          ]}
        />
        <ProgressStageStep
          start={2}
          name="Writing Exercises"
          levels={[
            {
              status: 'perfect',
              url: '/foo/level1',
            },
            {
              status: 'not_tried',
              url: '/foo/level2',
            },
            {
              status: 'not_tried',
              url: '/foo/level3',
            },
            {
              status: 'not_tried',
              url: '/foo/level4',
            },
            {
              status: 'not_tried',
              url: '/foo/level5',
            },
          ]}
        />
      </div>
    );
  }
});

export default ProgressStageContent;
