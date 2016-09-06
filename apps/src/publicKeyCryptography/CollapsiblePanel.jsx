/** @file Collapsible panel with title, used for each character in crypto widget */
import React from 'react';
import color from '../color';
import FontAwesome from '../templates/FontAwesome';
import {AnyChildren} from './types';

const style = {
  header: {
    fontFamily: `"Gotham 5r", sans-serif`,
    fontSize: 16,
    color: color.charcoal,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: color.charcoal,
    cursor: 'pointer'
  }
};

const CollapsiblePanel = React.createClass({
  propTypes: {
    title: React.PropTypes.string,
    children: AnyChildren
  },

  getInitialState() {
    return {
      collapsed: false
    };
  },

  onHeaderClick() {
    this.setState({collapsed: !this.state.collapsed});
  },

  render() {
    const collapsed = this.state.collapsed;

    const chevronStyle = {
      float: 'right',
      transition: 'transform 0.5s',
      transform: `scaleY(${collapsed ? 1 : -1})`
    };

    const bodyStyle = {
      transition: 'max-height 0.5s, opacity 0.5s',
      overflow: collapsed ? 'hidden' : 'inherit',
      maxHeight: collapsed ? 0 : 500,
      opacity: collapsed ? 0 : 1
    };

    return (
      <div className={`panel-${this.props.title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div style={style.header} onClick={this.onHeaderClick}>
          <FontAwesome icon="chevron-circle-down" className="fa-fw" style={chevronStyle} />
          {this.props.title}
        </div>
        <div style={bodyStyle}>
          {this.props.children}
        </div>
      </div>);
  }
});
export default CollapsiblePanel;
