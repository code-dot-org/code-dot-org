import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {connect} from 'react-redux';
import Dialog, {Body} from '../templates/Dialog';
import {hideAnimationJson} from './actions';

const style = {
  pre: {
    maxHeight: '75vh',
    overflowY: 'auto'
  }
};

const AnimationJsonViewer = createReactClass({
  propTypes: {
    isOpen: PropTypes.bool.isRequired,
    content: PropTypes.string,
    handleClose: PropTypes.func.isRequired
  },

  render() {
    return (
      <Dialog isOpen={this.props.isOpen} handleClose={this.props.handleClose}>
        <Body>
          <pre style={style.pre}>
            {this.props.content}
          </pre>
        </Body>
      </Dialog>
    );
  }
});
export default connect(
  state => state.animationJsonViewer,
  dispatch => ({
    handleClose: () => dispatch(hideAnimationJson())
  })
)(AnimationJsonViewer);
