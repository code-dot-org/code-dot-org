import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

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
            <MuiTypography
              variant="body3"
              component="div"
              className={classNames(styles.author, styles.overflowEllipsis)}
            >
              <InlineMarkdown
                markdown={i18n.authorName({name: library.userName})}
              />
            </MuiTypography>
          )}
        </div>
        <MuiTypography
          variant="body2"
          component="div"
          className={classNames(styles.description, styles.overflowEllipsis)}
        >
          {library.description}
        </MuiTypography>
        <div className={styles.actions}>
          {this.props.onAdd && (
            <Tooltip text={i18n.add()} place="bottom">
              <MuiIconButton
                variant="text"
                color="primary"
                size="small"
                aria-label={i18n.add()}
                onClick={() => this.props.onAdd(library.id)}
              >
                <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
              </MuiIconButton>
            </Tooltip>
          )}
          {this.props.onUpdate && (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => this.props.onUpdate(library.channelId)}
              startIcon={
                <FontAwesomeV6Icon iconName="arrows-rotate" iconStyle="solid" />
              }
            >
              {i18n.update()}
            </MuiButton>
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
              <MuiIconButton
                className="ui-test-remove-library"
                variant="text"
                color="error"
                size="small"
                aria-label={i18n.removeFromProject()}
                onClick={() => this.props.onRemove(library.channelId)}
                disabled={!!library.fromLevelbuilder}
              >
                <FontAwesomeV6Icon iconName="trash-can" iconStyle="regular" />
              </MuiIconButton>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }
}

export default LibraryListItem;
