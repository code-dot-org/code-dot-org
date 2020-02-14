import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const styles = {
  listItem: {
    marginLeft: 7,
    marginRight: 7,
    color: color.dark_charcoal,
    textAlign: 'left',
    display: 'flex',
    borderBottom: 'inset'
  },
  libraryName: {
    fontSize: 'large',
    marginTop: 10,
    textOverflow: 'ellipsis',
    flex: '0 0 250px',
    overflow: 'hidden'
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 10,
    lineHeight: '19px',
    position: 'relative',
    flexGrow: 1,
    marginRight: 5
  },
  viewCode: {
    position: 'absolute',
    right: 0,
    background: 'inherit'
  },
  addButton: {
    marginLeft: 'auto'
  },
  author: {
    color: color.black,
    fontWeight: 'bold'
  }
};

export default class LibraryListItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    onRefresh: PropTypes.func,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func,
    onViewCode: PropTypes.func
  };

  viewCode = event => {
    event.preventDefault();
    this.props.onViewCode();
  };

  render() {
    let library = this.props.library;
    return (
      <div className="assetRow" style={styles.listItem}>
        <span style={styles.libraryName}>{library.name}</span>
        <span style={styles.description}>
          {library.description}
          <br />
          {library.userName && (
            <span style={styles.author}>Author: {library.userName}</span>
          )}
          <a onClick={this.viewCode} style={styles.viewCode}>
            {i18n.viewCode()}
          </a>
        </span>
        {this.props.onAdd && (
          <button
            style={styles.addButton}
            type="button"
            onClick={() => this.props.onAdd(library.id)}
          >
            <FontAwesome icon="plus" />
          </button>
        )}
        {this.props.onRefresh && (
          <button
            type="button"
            onClick={() => this.props.onRefresh(library.name)}
            style={styles.refreshButton}
          >
            <FontAwesome icon="refresh" />
          </button>
        )}
        {this.props.onRemove && (
          <button
            type="button"
            onClick={() => this.props.onRemove(library.name)}
            className="btn-danger"
          >
            <FontAwesome icon="trash-o" />
          </button>
        )}
      </div>
    );
  }
}
