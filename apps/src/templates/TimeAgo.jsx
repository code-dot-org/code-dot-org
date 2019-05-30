import Moment from 'react-moment';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

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
    return (
      <Moment
        fromNow
        locale={this.props.locale || 'en'}
        style={this.props.style || {}}
      >
        {this.props.dateString}
      </Moment>
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
