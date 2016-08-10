/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import {AnyChildren} from './types';
import EqualColumns from './EqualColumns';
import {Alice, Eve, Bob} from './Characters';
import ModuloClock from './ModuloClock';

const PublicKeyCryptographyWidget = React.createClass({
  render() {
    return (
      <div>
        <HyperlinksList>
          <a href="https://docs.google.com/document/d/1rcXn-3B0JWY3ifeZkhVB3OFHNYClsY80LCIVIOOpExs/edit">Instructions</a>
          <a href="https://docs.google.com/document/d/1d6mEbpykWsFKP2PAC5cj7ak_ouoPrwhMcFpYf7xd_Yw/edit">How the math works</a>
        </HyperlinksList>
        <EqualColumns>
          <Alice/>
          <Eve/>
          <Bob/>
        </EqualColumns>
        <ModuloClock/>
      </div>);
  }
});
export default PublicKeyCryptographyWidget;

function HyperlinksList(props) {
  let children = React.Children.toArray(props.children);
  for (let i = children.length - 1; i > 0; i--) {
    children.splice(i, 0, ' | ');
  }
  return <div>{children}</div>;
}
HyperlinksList.propTypes = {
  children: AnyChildren
};
