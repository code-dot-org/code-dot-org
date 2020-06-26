import firehoseClient from '@cdo/apps/lib/util/firehose';
import React from 'react';
import {Button} from 'react-bootstrap';
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class AmazonFutureEngineerAccountConfirmation extends React.Component {
  returnToURL = relativeDashboardPath => {
    return studio(
      `${relativeDashboardPath}?user_return_to=${pegasus(
        '/amazon-future-engineer-eligibility'
      )}`
    );
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
        <h2>Almost done!</h2>
        <div>
          Thank you for completing your application information for the Amazon
          Future Engineer program. To finalize your participation and start
          receiving benefits, sign up for a Code.org account, or sign in if you
          already have one.
        </div>
        <div>
          Already have a Code.org account?{' '}
          <a href={this.returnToURL('/users/sign_in')}>Sign in.</a>
        </div>
        <Button
          id="sign_up"
          href={this.returnToURL('/users/sign_up')}
          onClick={this.logSignUpButtonPress}
        >
          Sign up
        </Button>
      </div>
    );
  }
}
