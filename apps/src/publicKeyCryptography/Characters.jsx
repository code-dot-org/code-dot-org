/** @file Character calculations, displayed side-by-side */
import React from 'react';

const style = {
  alice: {
    backgroundColor: 'red',
    height: 200,
  },
  eve: {
    backgroundColor: 'green',
    height: 200,
  },
  bob: {
    backgroundColor: 'blue',
    height: 200,
  }
};

const Characters = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.element,
      React.PropTypes.arrayOf(React.PropTypes.element)])
  },

  render() {
    const panelStyle = {
      float: 'left',
      width: (100 / React.Children.count(this.props.children)) + '%',
    };
    return (
      <div>
        {React.Children.map(this.props.children, child => (
          <div style={panelStyle}>
            {child}
          </div>
        ))}
        <div style={{clear:'both'}}/>
      </div>);
  }
});
export default Characters;

export function Alice() {
  return <div style={style.alice}/>;
}

export function Eve() {
  return <div style={style.eve}/>;
}

export function Bob() {
  return <div style={style.bob}/>;
}
