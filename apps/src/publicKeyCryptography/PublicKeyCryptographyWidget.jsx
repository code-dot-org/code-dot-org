/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import {AnyChildren} from './types';
import EqualColumns from './EqualColumns';
import Alice from './Alice';
import Bob from './Bob';
import Eve from './Eve';
import ModuloClock from './ModuloClock';
import {computePublicKey} from './cryptographyMath';

const style = {
  root: {
    fontFamily: `"Gotham 4r", sans-serif`
  },
  hyperlinksList: {
    fontFamily: `"Gotham 4r", sans-serif`,
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10
  }
};

/** Root component for Public Key Cryptography widget */
const PublicKeyCryptographyWidget = React.createClass({
  getInitialState() {
    return {
      publicModulus: null,
      privateKey: null,
      secretNumber: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({
      publicModulus,
      privateKey: null,
      secretNumber: null,
    });
  },

  setPrivateKey(privateKey) {
    // Calculate public key and push it to Eve and Bob (Alice uses the
    // authoritative public key, pushed as a prop)
    const {publicModulus} = this.state;
    const publicKey = this.publicKey({privateKey, publicModulus});
    this.eve.setPublicKey(publicKey);
    this.bob.setPublicKey(publicKey);
    this.setState({privateKey});
  },

  setSecretNumber(secretNumber) {
    this.setState({secretNumber});
  },

  publicKey({privateKey, publicModulus}) {
    return privateKey && publicModulus ? computePublicKey(privateKey, publicModulus) : null;
  },

  render() {
    const {
      publicModulus,
      privateKey,
      secretNumber
    } = this.state;
    return (
      <div style={style.root}>
        <HyperlinksList>
          <a href="https://docs.google.com/document/d/1rcXn-3B0JWY3ifeZkhVB3OFHNYClsY80LCIVIOOpExs/edit">Instructions</a>
          <a href="https://docs.google.com/document/d/1d6mEbpykWsFKP2PAC5cj7ak_ouoPrwhMcFpYf7xd_Yw/edit">How the math works</a>
        </HyperlinksList>
        <EqualColumns intercolumnarDistance={20}>
          <Alice
            ref={x => this.alice = x}
            publicModulus={publicModulus}
            privateKey={privateKey}
            publicKey={this.publicKey({privateKey, publicModulus})}
            setPublicModulus={this.setPublicModulus}
            setPrivateKey={this.setPrivateKey}
          />
          <Eve
            ref={x => this.eve = x}
            publicModulus={publicModulus}
            setPublicModulus={this.setPublicModulus}
          />
          <Bob
            ref={x => this.bob = x}
            publicModulus={publicModulus}
            setPublicModulus={this.setPublicModulus}
            secretNumber={secretNumber}
            setSecretNumber={this.setSecretNumber}
          />
        </EqualColumns>
        <ModuloClock/>
      </div>);
  }
});
export default PublicKeyCryptographyWidget;

/** Block of verticalbar-separated hyperlinks at top of page. */
function HyperlinksList(props) {
  let children = React.Children.toArray(props.children);
  for (let i = children.length - 1; i > 0; i--) {
    children.splice(i, 0, ' | ');
  }
  return (
    <div style={style.hyperlinksList}>
      {children}
    </div>);
}
HyperlinksList.propTypes = {
  children: AnyChildren
};
