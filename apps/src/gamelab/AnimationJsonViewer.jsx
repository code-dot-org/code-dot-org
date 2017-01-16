import React from 'react';
import {connect} from 'react-redux';
import Dialog, {Body} from '../templates/Dialog';
import {hideAnimationJson} from './actions';

const style = {
  pre: {
    maxHeight: '75vh',
    overflowY: 'auto'
  }
};

const AnimationJsonViewer = React.createClass({
  propTypes: {
    isOpen: React.PropTypes.bool.isRequired,
    content: React.PropTypes.string,
    handleClose: React.PropTypes.func.isRequired
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
