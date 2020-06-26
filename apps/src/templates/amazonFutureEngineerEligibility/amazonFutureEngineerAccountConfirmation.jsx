import firehoseClient from '@cdo/apps/lib/util/firehose';
import React from 'react';
import {Button} from 'react-bootstrap';
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '@cdo/apps/util/color';

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

export default class AmazonFutureEngineerAccountConfirmation extends React.Component {
  returnToURL = relativeDashboardPath => {
    return studio(`${relativeDashboardPath}?user_return_to=${pegasus('/afe')}`);
  };

  logSignUpButtonPress = () => {
    firehoseClient.putRecord({
      study: 'amazon-future-engineer-eligibility',
      event: 'sign_up_button_press'
    });
  };

  render() {
    // TO DO: Add links to account sign up page.
    // TO DO: Need to put submission data
    //  (currently kept in state of AmazonFutureEngineerEligibility component)
    //  somewhere (session cookie?) that will persist while they sign up or sign in,
    // at which point we'll send an API request to Amazon's Pardot API endpoint.
    return (
      <div>
        <h2 style={styles.header}>Almost done!</h2>
        <div style={styles.body}>
          Thank you for completing your application information for the Amazon
          Future Engineer program. To finalize your participation and start
          receiving benefits, sign up for a Code.org account, or sign in if you
          already have one.
        </div>
        <div style={styles.body}>
          Already have a Code.org account?{' '}
          <a href={this.returnToURL('/users/sign_in')}>Sign in.</a>
        </div>
        <Button
          id="sign_up"
          href={this.returnToURL('/users/sign_in')}
          style={styles.button}
          onClick={this.logSignUpButtonPress}
        >
          Sign up
        </Button>
      </div>
    );
  }
}
