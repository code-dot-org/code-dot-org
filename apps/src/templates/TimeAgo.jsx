import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';

class TimeAgo extends React.Component {
  static propTypes = {
    dateString: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]).isRequired,
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

// Expose the "unconnected" version of the component as specifically
// "unlocalized", to support usage in places where we don't have access to the
// redux store or the locale and to make it clear what we lose in that
// situation.
export const UnlocalizedTimeAgo = TimeAgo;

export default connect(state => ({
  locale: state.pageConstants && state.pageConstants.locale
}))(TimeAgo);
