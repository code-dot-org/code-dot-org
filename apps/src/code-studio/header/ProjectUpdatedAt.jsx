import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

const style = {
  display: 'block',
  textAlign: 'left'
};

class ScriptName extends React.Component {
  static propTypes = {
    show: PropTypes.bool,
    updatedAt: PropTypes.instanceOf(Date)
  };

  componentDidMount() {
    // TODO replace this with a React implementation
    if (this.props.updatedAt) {
      $('.project_updated_at span.timestamp').timeago();
    }
  }

  render() {
    if (!this.props.show) {
      return;
    }

    return (
      <div className="project_updated_at header_text" style={style}>
        {this.props.updatedAt
          ? [
              'Saved ',
              <span className="timestamp" title={this.props.updatedAt} />
            ]
          : 'Not saved'}
      </div>
    );
  }
}

export default connect(state => ({
  show: state.header.showProjectUpdatedAt,
  updatedAt: state.header.projectUpdatedAt
}))(ScriptName);
