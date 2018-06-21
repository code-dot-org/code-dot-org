/*
 * Info box prompting user to sign in on workshop enrollment page
 */
import React, {PropTypes} from 'react';

export default class SignInPrompt extends React.Component {
  static propTypes = {
    info_icon: PropTypes.string,
    sign_in_url: PropTypes.string
  };

  render() {
    return (
      <div className="info-box-teal">
        <div className="info-box-left">
          <img src={this.props.info_icon}/>
        </div>
        <div className="info-box-right">
          <p>
            <span className="info-box-message">
              Already have a Code.org account?
            </span>
          </p>
          <p>
            <a href={this.props.sign_in_url}>Sign in</a> first to pre-fill some information.
          </p>
        </div>
      </div>
    );
  }
}
