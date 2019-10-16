import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

const styles = {
  listItem: {
    marginLeft: 7,
    marginRight: 7,
    color: color.dark_charcoal,
    textAlign: 'left',
    display: 'flex',
    position: 'relative'
  },
  libraryName: {
    fontSize: 'large',
    marginTop: 10,
    textOverflow: 'ellipsis',
    flex: '0 0 250px'
  },
  description: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 10,
    lineHeight: '15px'
  },
  moreDetails: {
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  moreDetailsWithAdd: {
    position: 'absolute',
    bottom: 0,
    right: 50
  }
};

export default class LibraryListItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    onRefresh: PropTypes.func,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func
  };

  displayDescription = _ => {
    return "My Library's very long description that goes off the page.";
  };

  moreDetails = _ => {
    return 'See More Details';
  };

  getMoreDetailsStyle = () => {
    return this.props.onAdd ? styles.moreDetailsWithAdd : styles.moreDetails;
  };

  render() {
    let library = this.props.library;
    return (
      <div className="assetRow" style={styles.listItem}>
        <span style={styles.libraryName}>{library.name}</span>
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
            style={styles.deleteButton}
            className="btn-danger"
          >
            <FontAwesome icon="trash-o" />
          </button>
        )}
        <span style={styles.description}>
          {this.displayDescription(library.description)}
        </span>
        <span style={this.getMoreDetailsStyle()}>
          {this.moreDetails(library)}
        </span>
        {this.props.onAdd && (
          <button type="button" onClick={() => this.props.onAdd(library.id)}>
            <FontAwesome icon="plus" />
          </button>
        )}
      </div>
    );
  }
}
