import firehoseClient from '@cdo/apps/lib/util/firehose';
import React from 'react';
import {Button} from 'react-bootstrap';
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '@cdo/apps/util/color';

const RETURN_TO = `user_return_to=${pegasus('/afe/submit')}`;
const SIGN_UP_URL = studio(
  `/users/sign_up?user[user_type]=teacher&${RETURN_TO}`
);
const SIGN_IN_URL = studio(`/users/sign_in?${RETURN_TO}`);

export default class AmazonFutureEngineerAccountConfirmation extends React.Component {
  signUpButtonPress = () => {
    firehoseClient.putRecord(
      {
        study: 'amazon-future-engineer-eligibility',
        event: 'sign_up_button_press'
      },
      {callback: () => (window.location = SIGN_UP_URL)}
    );
  };

  signInButtonPress = event => {
    event.preventDefault();

    firehoseClient.putRecord(
      {
        study: 'amazon-future-engineer-eligibility',
        event: 'sign_in_button_press'
      },
      {callback: () => (window.location = SIGN_IN_URL)}
    );
  };

  render() {
    return (
      <div>
        <h2 style={styles.header}>Almost done!</h2>
        <div style={styles.body}>
          Thank you for completing your application information for the Amazon
          Future Engineer program. To finalize your participation and start
          receiving benefits, sign up for a Code.org teacher account, or sign in
          if you already have one.
        </div>
        <div style={styles.body}>
          Already have a Code.org account?{' '}
          <a href="#" onClick={this.signInButtonPress}>
            Sign in.
          </a>
        </div>
        <Button
          id="sign_up"
          style={styles.button}
          onClick={this.signUpButtonPress}
        >
          Sign up
        </Button>
      </div>
    );
  }
}

const styles = {
  button: {
    backgroundColor: color.orange,
    color: color.white
  },
  header: {
    marginTop: '10px',
    marginBottom: '10px'
  },
  body: {
    marginBottom: '10px'
  }
};
