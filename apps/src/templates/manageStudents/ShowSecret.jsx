import React, {Component, PropTypes} from 'react';
import Button from '../Button';

const styles = {
  reset: {
    marginRight: 10,
  },
  image: {
    width: 45
  }
};

class ShowSecret extends Component {
  static propTypes = {
    isShowing: PropTypes.bool,
    secretWord: PropTypes.string.isRequired,
    secretPicture: PropTypes.string.isRequired,
    resetSecret: PropTypes.func.isRequired,
    loginType: PropTypes.string.isRequired,
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
            {this.props.loginType === 'word' &&
              <p>{this.props.secretWord}</p>
            }
            {this.props.loginType === 'picture' &&
              <img src={this.props.secretPicture} style={styles.image} />
            }
            <Button onClick={this.reset} color="blue" text="Reset" style={styles.reset} />
            <Button onClick={this.hide} color="white" text="Hide secret" />
          </div>
        }
      </div>
    );
  }
}

export default ShowSecret;
