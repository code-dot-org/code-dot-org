import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import InlineMarkdown from '@cdo/apps/templates/InlineMarkdown';
import Tooltip from '@cdo/apps/templates/Tooltip';
import i18n from '@cdo/locale';

import styles from './library-list-item.module.scss';

export class LibraryListItem extends React.Component {
  static propTypes = {
    library: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    onRemove: PropTypes.func,
    onAdd: PropTypes.func,
    onViewCode: PropTypes.func,
  };

  viewCode = event => {
    event.preventDefault();
    this.props.onViewCode();
  };

  render() {
    let library = this.props.library;

    return (
      <div className={styles.listItem}>
        <div
          className={classNames(styles.titleSection, styles.overflowEllipsis)}
        >
          <Tooltip text={i18n.viewCode()} place="bottom">
            <a onClick={this.viewCode} className={styles.libraryTitle}>
              {library.name}
            </a>
          </Tooltip>
          {library.userName && (
            <div className={classNames(styles.author, styles.overflowEllipsis)}>
              <InlineMarkdown
                markdown={i18n.authorName({name: library.userName})}
              />
            </div>
          )}
        </div>
        <div
          className={classNames(styles.description, styles.overflowEllipsis)}
        >
          {library.description}
        </div>
        <div className={styles.actions}>
          {this.props.onAdd && (
            <Tooltip text={i18n.add()} place="bottom">
              <button
                type="button"
                key={'add-' + library.id}
                onClick={() => this.props.onAdd(library.id)}
                className={classNames(styles.actionBtn, styles.addBtn)}
              >
                <FontAwesome icon="plus" className={styles.iconPadding} />
              </button>
            </Tooltip>
          )}
          {this.props.onUpdate && (
            <button
              type="button"
              key={'update-' + library.id}
              onClick={() => this.props.onUpdate(library.channelId)}
              className={classNames(styles.actionBtn, styles.updateBtn)}
            >
              <FontAwesome icon="refresh" className={styles.updateIcon} />
              <span className={styles.updateText}>{i18n.update()}</span>
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
                key={'remove-' + library.id}
                onClick={() => this.props.onRemove(library.channelId)}
                className={classNames(
                  'ui-test-remove-library',
                  styles.actionBtn,
                  styles.removeBtn
                )}
                disabled={!!library.fromLevelbuilder}
              >
                <FontAwesome icon="trash-o" className={styles.iconPadding} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
}

export default LibraryListItem;
