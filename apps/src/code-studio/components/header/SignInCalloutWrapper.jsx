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
    // Before the cookies are set, searching for them will return false, so the
    // desired flag should logically read 'true' when set: resulting in the
    // 'hide' name. Though this leads to a bit of a double negative in the
    // display logic (if not hide: display), it is the clearest option for now.
    this.state = {
      hideCallout:
        // The use of both session storage and cookies is to check for 1 day
        // and 1 session, and display the callout again once BOTH have passed.
        cookies.get(HideSignInCallout) === 'true' ||
        sessionStorage.getItem(HideSignInCallout) === 'true'
    };
  }

  // When the component mounts, retrieve sign in button updates from
  // z_index_above_modal class within application.scss to pull button forward
  componentDidMount() {
    if (!this.state.hideCallout) {
      this.signInElement = document.getElementById('sign_in_or_user');
      this.signInElement &&
        this.signInElement.classList.add('z_index_above_modal');
    }
  }

  // Upon close, set both cookies and session storage, and prevent the click
  // event from being bubbled up to any other components. The path '/' allows
  // the data to be seen one directory higher.
  // Additionally, remove special sign in button rendering from the document
  closeCallout(event) {
    this.setState({hideCallout: true});
    cookies.set(HideSignInCallout, 'true', {expires: 1, path: '/'});
    sessionStorage.setItem(HideSignInCallout, 'true');
    event.preventDefault();
    this.signInElement &&
      this.signInElement.classList.remove('z_index_above_modal');
  }

  // After the first dismissal, this returns null
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
