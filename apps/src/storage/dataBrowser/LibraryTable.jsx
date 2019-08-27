import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import FontAwesome from '../../templates/FontAwesome';
import msg from '@cdo/locale';

class LibraryTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  };

  state = {
    collapsed: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    return (
      <div>
        <a onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon} />
          <span>{this.props.name}</span>
        </a>
        {!this.state.collapsed && (
          <div>
            <div>{this.props.description}</div>
            <button type="button"> {msg.preview()} </button>
            <button type="button"> {msg.import()} </button>
          </div>
        )}
      </div>
    );
  }
}

export default Radium(LibraryTable);
