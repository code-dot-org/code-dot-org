import React from 'react';
import cookies from 'js-cookie';
import SignInCallout from './SignInCallout';

const HideSignInCallout = 'hide_signin_callout';

// This class hold the display logic for the sign in callout, which prompts
// students to log in in order to save their progress. The callout's freqency
// is regulated here by the use of both session storage and cookies.
export default class SignInCalloutWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.closeCallout = this.closeCallout.bind(this);
    // The use of both session storage and cookies is to check for 1 day
    // and 1 session, and display the callout again only once BOTH have passed.
    this.state = {
      hideCallout:
        cookies.get(HideSignInCallout) === 'true' ||
        sessionStorage.getItem(HideSignInCallout) === 'true'
    };
  }

  closeCallout(event) {
    this.setState({hideCallout: true});
    cookies.set(HideSignInCallout, 'true', {expires: 1, path: '/'});
    sessionStorage.setItem(HideSignInCallout, 'true');
    event.preventDefault();
  }

  // For readibility: returning an empty div here explicitly if the callout is
  // not supposed to be displayed. This avoids using a render statement that
  // often returns *nothing.
  render() {
    if (this.state.hideCallout) {
      return null;
    } else {
      return (
        <div className="uitest-signincallout">
          <SignInCallout handleClose={this.closeCallout} />
        </div>
      );
    }
  }
}
