/** @file Root component for Public Key Cryptography widget */
import React from 'react';
import Characters, {Alice, Eve, Bob} from './Characters';
import ModuloClock from './ModuloClock';

const PublicKeyCryptographyWidget = React.createClass({
  render() {
    return (
      <div>
        <HyperlinksList>
          <a href="https://docs.google.com/document/d/1rcXn-3B0JWY3ifeZkhVB3OFHNYClsY80LCIVIOOpExs/edit">Instructions</a>
          <a href="https://docs.google.com/document/d/1d6mEbpykWsFKP2PAC5cj7ak_ouoPrwhMcFpYf7xd_Yw/edit">How the math works</a>
        </HyperlinksList>
        <Characters>
          <Alice/>
          <Eve/>
          <Bob/>
        </Characters>
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
  return (
    <div>
      {children}
    </div>);
}
HyperlinksList.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.element,
    React.PropTypes.arrayOf(React.PropTypes.element)])
};
