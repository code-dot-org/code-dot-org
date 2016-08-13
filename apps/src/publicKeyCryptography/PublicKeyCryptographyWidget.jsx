/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import {AnyChildren} from './types';
import EqualColumns from './EqualColumns';
import {Alice, Eve, Bob} from './Characters';
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
      privateKey: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({
      publicModulus,
      privateKey: null
    });
  },

  setPrivateKey(privateKey) {
    this.setState({privateKey});
  },

  render() {
    const {
      publicModulus,
      privateKey
    } = this.state;
    const publicKey = privateKey && publicModulus ? computePublicKey(privateKey, publicModulus) : undefined;
    return (
      <div style={style.root}>
        <HyperlinksList>
          <a href="https://docs.google.com/document/d/1rcXn-3B0JWY3ifeZkhVB3OFHNYClsY80LCIVIOOpExs/edit">Instructions</a>
          <a href="https://docs.google.com/document/d/1d6mEbpykWsFKP2PAC5cj7ak_ouoPrwhMcFpYf7xd_Yw/edit">How the math works</a>
        </HyperlinksList>
        <EqualColumns intercolumnarDistance={20}>
          <Alice
            publicModulus={publicModulus}
            privateKey={privateKey}
            publicKey={publicKey}
            setPublicModulus={this.setPublicModulus}
            setPrivateKey={this.setPrivateKey}
          />
          <Eve
            publicModulus={publicModulus}
            publicKey={publicKey}
            setPublicModulus={this.setPublicModulus}
          />
          <Bob
            publicModulus={publicModulus}
            publicKey={publicKey}
            setPublicModulus={this.setPublicModulus}
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
