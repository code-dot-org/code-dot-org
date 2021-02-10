import React from 'react';
import cookies from 'js-cookie';
import SignInCallout from './SignInCallout';

const HideSignInCallout = 'hide_signin_callout';

// The use of both session storage and cookies is to check for 1 day
// and 1 session, and display the callout again only once BOTH have passed.
export default class SignInCalloutLogic extends React.Component {
  constructor(props) {
    super(props);
    this.closeCallout = this.closeCallout.bind(this);
    this.state = {
      showCallout: !(
        cookies.get(HideSignInCallout) === 'true' ||
        sessionStorage.getItem(HideSignInCallout) === 'true'
      )
    };
  }

  closeCallout(event) {
    this.setState({showCallout: false});
    cookies.set(HideSignInCallout, 'true', {expires: 1, path: '/'});
    sessionStorage.setItem(HideSignInCallout, 'true');
    event.preventDefault();
  }

  // For readibility: returning an empty div here explicitly if the callout is
  // not supposed to be displayed. This avoids using a render statement that
  // often returns *nothing.
  render() {
    if (this.state.showCallout) {
      return (
        <div className="uitest-signincallout">
          <SignInCallout handleClose={this.closeCallout} />
        </div>
      );
    } else {
      return <div />;
    }
  }
}
