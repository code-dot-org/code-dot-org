import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import FontAwesome from '../../templates/FontAwesome';
import FirebaseStorage from '../firebaseStorage';
import msg from '@cdo/locale';

const styles = {
  tableName: {
    cursor: 'pointer'
  }
};

class LibraryTable extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    current: PropTypes.bool.isRequired
  };

  state = {
    collapsed: true
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  importTable = () => {
    if (this.props.current) {
      // TODO: Implement current tables (see STAR-615)
    } else {
      FirebaseStorage.copyStaticTable(
        this.props.name,
        () => {
          console.log('success');
        },
        err => {
          console.log(err);
        }
      );
    }
  };

  render() {
    const icon = this.state.collapsed ? 'caret-right' : 'caret-down';
    return (
      <div>
        <a style={styles.tableName} onClick={this.toggleCollapsed}>
          <FontAwesome icon={icon} />
          <span>{this.props.name}</span>
        </a>
        {!this.state.collapsed && (
          <div>
            <div>{this.props.description}</div>
            <button type="button"> {msg.preview()} </button>
            <button type="button" onClick={this.importTable}>
              {msg.import()}
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default Radium(LibraryTable);
