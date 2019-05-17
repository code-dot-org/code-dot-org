import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

class TimeAgo extends React.Component {
  static propTypes = {
    dateString: PropTypes.string.isRequired,
    locale: PropTypes.string,
    style: PropTypes.object
  };

  render() {
    if (this.props.locale) {
      moment.locale(this.props.locale);
    }

    return (
      <time style={this.props.style || {}} dateTime={this.props.dateString}>
        {moment(this.props.dateString).fromNow()}
      </time>
    );
  }
}

export default connect(state => ({
  locale: state.pageConstants && state.pageConstants.locale
}))(TimeAgo);
