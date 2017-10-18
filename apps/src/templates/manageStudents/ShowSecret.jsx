import React, {Component, PropTypes} from 'react';
import Button from '../Button';

const styles = {
  reset: {
    marginRight: 10,
  }
};

class ShowSecret extends Component {
  static propTypes = {
    isShowing: PropTypes.bool,
    secret: PropTypes.string.isRequired,
    resetSecret: PropTypes.func.isRequired,
  };

  state = {
    isShowing: !!this.props.isShowing,
  };

  show = () => {
    this.setState({
      isShowing: true
    });
  };

  hide = () => {
    this.setState({
      isShowing: false
    });
  };

  reset = () => {
    this.props.resetSecret();
    this.setState({
      isShowing: false
    });
  };

  render() {
    return (
      <div>
        {!this.state.isShowing &&
          <Button onClick={this.show} color="white" text="Show secret" />
        }
        {this.state.isShowing &&
          <div>
            <p>{this.props.secret}</p>
            <Button onClick={this.reset} color="blue" text="Reset" style={styles.reset} />
            <Button onClick={this.hide} color="white" text="Hide secret" />
          </div>
        }
      </div>
    );
  }
}

export default ShowSecret;
