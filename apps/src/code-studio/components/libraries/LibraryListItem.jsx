import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';

const styles = {
  overflowEllipsis: {
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  listItem: {
    padding: 8,
    margin: 2,
    color: color.dark_charcoal,
    textAlign: 'left',
    display: 'flex',
    borderBottom: `1px solid ${color.lightest_gray}`,
    lineHeight: 1.5
  },
  libraryTitle: {
    fontFamily: "'Gotham 5r', sans-serif",
    fontSize: 16,
    color: color.link_color,
    ':hover': {
      color: color.link_color
    }
  },
  description: {
    marginRight: 25,
    flexShrink: 2
  },
  actions: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  actionBtn: {
    padding: 8,
    fontSize: 18
  },
  iconPadding: {
    padding: '0 2px'
  },
  addBtn: {
    color: color.dark_charcoal,
    borderColor: color.dark_charcoal
  },
  updateBtn: {
    color: color.orange,
    backgroundColor: color.white,
    borderColor: color.orange,
    ':hover': {
      color: color.white,
      backgroundColor: color.orange
    }
  },
  updateText: {
    fontFamily: "'Gotham 5r', sans-serif",
    paddingLeft: 5,
    fontSize: 16
  },
  removeBtn: {
    color: color.dark_red,
    backgroundColor: color.white,
    borderColor: color.dark_red,
    ':hover': {
      color: color.white,
      backgroundColor: color.dark_red
    }
  }
};

export class LibraryListItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    // TODO: RENAME TO onUpdate
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
      <div style={styles.listItem}>
        <div style={[{marginRight: 25}, styles.overflowEllipsis]}>
          <a onClick={this.viewCode} style={styles.libraryTitle}>
            {library.name}
          </a>
          {library.userName && (
            <div style={[styles.author, styles.overflowEllipsis]}>
              <InlineMarkdown
                markdown={i18n.authorName({name: library.userName})}
              />
            </div>
          )}
        </div>
        <div style={[styles.description, styles.overflowEllipsis]}>
          {library.description}
        </div>
        <div style={styles.actions}>
          {this.props.onAdd && (
            <button
              type="button"
              key={'add-' + library.id}
              onClick={() => this.props.onAdd(library.id)}
              style={[styles.actionBtn, styles.addBtn]}
            >
              <FontAwesome icon="plus" style={styles.iconPadding} />
            </button>
          )}
          {this.props.onRefresh && (
            <button
              type="button"
              key={'update-' + library.id}
              onClick={() => this.props.onRefresh(library.name)}
              style={[styles.actionBtn, styles.updateBtn]}
            >
              <FontAwesome icon="refresh" style={{padding: '0 1px'}} />
              <span style={styles.updateText}>{i18n.update()}</span>
            </button>
          )}
          {this.props.onRemove && (
            <button
              type="button"
              key={'remove-' + library.id}
              onClick={() => this.props.onRemove(library.name)}
              style={[styles.actionBtn, styles.removeBtn]}
            >
              <FontAwesome icon="trash-o" style={styles.iconPadding} />
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default Radium(LibraryListItem);
