import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import LegacyDialog from '../../code-studio/LegacyDialog';

class ResourceLink extends React.Component {
  static propTypes = {
    highlight: PropTypes.bool,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired
  };

  state = {
    dialogSelected: false
  };

  selectResource = e => {
    if (e.shiftKey || e.metaKey || e.altKey) {
      // Don't open modal, just open link in new tab/window
      return;
    }
    // Don't open link, just open modal.
    e.preventDefault();
    var dialog = new LegacyDialog({
      body: $('<iframe>')
        .addClass('instructions-container')
        .width('100%')
        .attr('src', this.props.reference),
      autoResizeScrollableElement: '.instructions-container',
      id: 'block-documentation-lightbox'
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

    const iconStyle = {
      ...styles.commonIcon,
      ...(highlight ? styles.mapIcon : styles.resourceIcon)
    };
    const thumbnailStyle = {
      ...styles.commonThumbnail,
      ...(highlight && styles.mapThumbnail)
    };

    return (
      <div>
        <div style={styles.resourceStyle} onClick={this.selectResource}>
          <span style={thumbnailStyle}>
            <FontAwesome icon={icon} style={iconStyle} title={text} />
          </span>
          <a href={this.props.reference} style={styles.textLink}>
            {text}
          </a>
        </div>
      </div>
    );
  }
}

const styles = {
  textLink: {
    display: 'inline-block',
    margin: 8,
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: '25px',
    cursor: 'pointer',
    maxWidth: '90%'
  },
  mapThumbnail: {
    backgroundColor: color.teal
  },
  commonThumbnail: {
    borderRadius: 5,
    paddingLeft: 26,
    paddingRight: 26,
    paddingTop: 16,
    paddingBottom: 9
  },
  commonIcon: {
    fontSize: 22
  },
  mapIcon: {
    color: color.white
  },
  resourceIcon: {
    color: color.teal
  },
  resourceStyle: {
    margin: 8
  }
};

export default Radium(ResourceLink);
