import PropTypes from 'prop-types';
import React from 'react';
import Alert from '@cdo/apps/templates/alert';

const styles = {
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0
  }
};

export default class WorkspaceAlert extends React.Component {
  static propTypes = {
    left: PropTypes.number,
    children: PropTypes.element,
    onClose: PropTypes.func
  };

  render() {
    return (
      <div style={{...styles.container, ...{left: this.props.left}}}>
        <Alert
          onClose={this.props.onClose}
          type={'warning'}
          sideMargin={0}
          bottomMargin={0}
          closeDelayMillis={0}
          childPadding={'8px 14px'}
        >
          {this.props.children}
        </Alert>
      </div>
    );
  }
}

// TODO: Update styles so everything displays correctly
// TODO: Add logic to handle craft & blockly
// TODO: Unit tests
