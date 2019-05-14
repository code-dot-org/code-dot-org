import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import MinimalProjectHeader from './MinimalProjectHeader';

class ProjectInfo extends React.Component {
  static propTypes = {
    showMinimalProjectHeader: PropTypes.bool
  };

  render() {
    return (
      <div>
        {this.props.showMinimalProjectHeader && <MinimalProjectHeader />}
      </div>
    );
  }
}

export default connect(state => ({
  showMinimalProjectHeader: state.header.showMinimalProjectHeader
}))(ProjectInfo);
