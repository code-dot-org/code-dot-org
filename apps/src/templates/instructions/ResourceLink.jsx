import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';

import LegacyDialog from '../../code-studio/LegacyDialog';

import styles from './ResourceLink.module.scss';

class ResourceLink extends React.Component {
  static propTypes = {
    highlight: PropTypes.bool,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
    openReferenceInNewTab: PropTypes.bool,
  };

  state = {
    dialogSelected: false,
  };

  selectResource = e => {
    if (e.shiftKey || e.metaKey || e.altKey) {
      // Don't open modal, just open link in new tab/window
      return;
    }
    e.preventDefault();
    if (!!this.props.openReferenceInNewTab) {
      window.open(this.props.reference, '_blank', 'noopener,noreferrer');
      return;
    }
    // Don't open link, just open modal.
    var dialog = new LegacyDialog({
      body: $('<iframe>')
        .addClass('instructions-container')
        .width('100%')
        .attr('src', this.props.reference),
      autoResizeScrollableElement: '.instructions-container',
      id: 'block-documentation-lightbox',
    });
    dialog.show();

    // Forces the documentation in the iframe to be scrollable (our documentation
    // is not consistent about overflow)
    // TODO: EPEACH - explore removing this during transition away from legacy dialog
    $('.instructions-container').load(() => {
      $('.instructions-container')
        .contents()
        .find('body')
        .css({overflow: 'auto'});
    });
  };

  render() {
    const {icon, text, highlight} = this.props;

    const iconClass = classNames(styles.commonIcon, {
      [styles.mapIcon]: highlight,
      [styles.resourceIcon]: !highlight,
    });
    const thumbnailClass = classNames(styles.commonThumbnail, {
      [styles.mapThumbnail]: highlight,
    });

    return (
      <div>
        <div className={styles.resourceStyle} onClick={this.selectResource}>
          <span className={thumbnailClass}>
            <FontAwesome icon={icon} className={iconClass} title={text} />
          </span>
          <a href={this.props.reference} className={styles.textLink}>
            {text}
          </a>
        </div>
      </div>
    );
  }
}

export default ResourceLink;
