import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import Tooltip from '@cdo/apps/templates/Tooltip';

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
    cursor: 'pointer',
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
    fontSize: 18,
    backgroundColor: color.white,
    ':hover': {
      boxShadow: 'none'
    }
  },
  iconPadding: {
    padding: '0 2px'
  },
  addBtn: {
    color: color.link_color,
    borderColor: color.link_color,
    ':hover': {
      color: color.white,
      backgroundColor: color.link_color
    }
  },
  updateBtn: {
    color: color.orange,
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
    borderColor: color.dark_red,
    ':hover': {
      color: color.white,
      backgroundColor: color.dark_red
    },
    ':disabled': {
      color: color.light_gray,
      borderColor: color.light_gray,
      backgroundColor: color.lightest_gray,
      cursor: 'default'
    }
  }
};

export class LibraryListItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
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
          <Tooltip text={i18n.viewCode()} place="bottom">
            <a onClick={this.viewCode} style={styles.libraryTitle}>
              {library.name}
            </a>
          </Tooltip>
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
            <Tooltip text={i18n.add()} place="bottom">
              <button
                type="button"
                key={'add-' + library.id}
                onClick={() => this.props.onAdd(library.id)}
                style={[styles.actionBtn, styles.addBtn]}
              >
                <FontAwesome icon="plus" style={styles.iconPadding} />
              </button>
            </Tooltip>
          )}
          {this.props.onUpdate && (
            <button
              type="button"
              key={'update-' + library.id}
              onClick={() => this.props.onUpdate(library.channelId)}
              style={[styles.actionBtn, styles.updateBtn]}
            >
              <FontAwesome icon="refresh" style={{padding: '0 1px'}} />
              <span style={styles.updateText}>{i18n.update()}</span>
            </button>
          )}
          {this.props.onRemove && (
            <Tooltip
              text={
                library.fromLevelbuilder
                  ? i18n.cannotDeleteLibrary()
                  : i18n.removeFromProject()
              }
              place="bottom"
            >
              <button
                type="button"
                className="ui-test-remove-library"
                key={'remove-' + library.id}
                onClick={() => this.props.onRemove(library.channelId)}
                style={[styles.actionBtn, styles.removeBtn]}
                disabled={!!library.fromLevelbuilder}
              >
                <FontAwesome icon="trash-o" style={styles.iconPadding} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
}

export default Radium(LibraryListItem);
