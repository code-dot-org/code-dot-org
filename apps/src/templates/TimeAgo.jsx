import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

class TimeAgo extends React.Component {
  static propTypes = {
    dateString: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    locale: PropTypes.string,
    style: PropTypes.object,
  };

  state = {
    timeout: undefined,
  };

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  startTimer = () => {
    // Check for display updates every ten seconds. The smallest time delta
    // that actually makes a difference for display is 1 minute, so this is
    // quite generous.
    //
    // Note this component could be much more clever; if the given date is
    // within a few minutes of now, update this quickly, but if it's a couple
    // hours ago update much less frequently and if it's even longer ago then
    // maybe don't bother updating at all.
    //
    // For now, that seems like a unnecessary optimization.
    const timeout = setTimeout(this.startTimer, 10 * 1000);
    this.setState({timeout});
  };

  clearTimer = () => {
    clearTimeout(this.state.timeout);
    this.setState({
      timeout: undefined,
    });
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
  locale: state.pageConstants && state.pageConstants.locale,
}))(TimeAgo);
