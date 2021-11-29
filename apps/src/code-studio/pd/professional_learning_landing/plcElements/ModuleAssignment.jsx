import PropTypes from 'prop-types';
import React from 'react';
import color from '../../../../util/color';

export default class ModuleAssignment extends React.Component {
  static propTypes = {
    moduleAssignmentData: PropTypes.object
  };

  render() {
    return (
      <a href={this.props.moduleAssignmentData.link}>
        <div style={styles.moduleAssignmentSection}>
          {this.props.moduleAssignmentData.category}
          <div style={styles.ribbonWrapper}>
            <div
              style={Object.assign(
                {},
                styles.ribbon,
                styles.ribbonStylesForStatus[
                  `${this.props.moduleAssignmentData.status}`
                ]
              )}
            />
          </div>
        </div>
      </a>
    );
  }
}

const styles = {
  moduleAssignmentSection: {
    borderRadius: '5px',
    margin: '10px',
    padding: '5px',
    backgroundColor: color.cyan,
    color: 'white',
    position: 'relative',
    fontFamily: '"Gotham 4r"'
  },
  ribbonWrapper: {
    width: '90px',
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: '0px',
    right: '0px'
  },
  ribbon: {
    transform: 'rotate(45deg)',
    position: 'relative',
    padding: '7px 0',
    left: '-1px',
    top: '10px',
    width: '120px',
    backgroundColor: 'red'
  },
  ribbonStylesForStatus: {
    not_started: {backgroundColor: 'white'},
    in_progress: {backgroundColor: color.mustardyellow},
    completed: {backgroundColor: '#0EBE0E'}
  }
};
