import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

/**
 * A list of icons, maybe filtered by a search query.
 */
export default class IconListEntry extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    iconId: PropTypes.string.isRequired,
    altMatch: PropTypes.string.isRequired,
    query: PropTypes.instanceOf(RegExp).isRequired,
    search: PropTypes.string.isRequired,
  };

  highlightSearch(str) {
    const offset = str.indexOf(this.props.search);
    if (offset === -1) {
      return str;
    }
    const left = str.substr(0, offset);
    const right = str.substr(offset + this.props.search.length);
    return (
      <span>
        {left}
        <span style={{backgroundColor: '#ffc'}}>{this.props.search}</span>
        {right}
      </span>
    );
  }

  render() {
    const styles = {
      altMatchText: {
        float: 'left',
        fontSize: '13px',
        color: '#999',
      },
      iconLabel: {
        float: 'left',
        margin: '0 5px',
        fontSize: '13px',
        color: '#000',
      },
    };

    let iconLabel, columnWidth, altMatchText;

    if (this.props.search) {
      columnWidth = '33%';

      let highlightedName = this.props.iconId;
      if (!this.props.query.test(this.props.iconId)) {
        // We matched based on an alternate keyword, show that keyword in parens
        // next to the icon ID.
        altMatchText = (
          <p style={styles.altMatchText}>
            ({this.highlightSearch(this.props.altMatch)})
          </p>
        );
      } else {
        highlightedName = this.highlightSearch(this.props.iconId);
      }

      iconLabel = (
        <div>
          <p style={styles.iconLabel}>{highlightedName}</p>
          {altMatchText}
        </div>
      );
    }

    const rootStyles = {
      float: 'left',
      width: columnWidth,
      height: '35px',
      cursor: 'pointer',
    };

    const asset = 'fa-' + this.props.iconId;

    return (
      <div
        style={rootStyles}
        title={this.props.iconId}
        onClick={this.props.assetChosen.bind(null, asset)}
      >
        <Icon iconId={this.props.iconId} />
        {iconLabel}
      </div>
    );
  }
}

window.dashboard = window.dashboard || {};
window.dashboard.IconListEntry = IconListEntry;
