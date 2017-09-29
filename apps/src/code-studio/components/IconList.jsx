import React, {PropTypes} from 'react';
import IconListEntry from './IconListEntry';
import { aliases } from './icons';
import i18n from '@cdo/locale';

/**
 * A component for managing icons.
 */
var IconList = React.createClass({
  propTypes: {
    assetChosen: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired
  },

  getMatches: function (query) {
    var results = {};

    Object.keys(aliases).forEach(function (alias) {
      if (query.test(alias)) {
        aliases[alias].forEach(function (match) {
          results[match] = alias;
        });
      }
    });

    return results;
  },

  render: function () {
    var styles = {
      root: {
        height: '330px',
        overflowY: 'scroll',
        clear: 'both'
      }
    };

    var search = this.props.search;
    if (search[0] !== '-') {
      search = '(^|-)' + search;
    }
    var query = new RegExp(search);
    var results = this.getMatches(query);

    var iconEntries = Object.keys(results).map(function (iconId) {
      return (
        <IconListEntry
          key={iconId}
          assetChosen={this.props.assetChosen}
          iconId={iconId}
          altMatch={results[iconId]}
          query={query}
          search={this.props.search}
        />
      );
    }.bind(this));

    return (
      <div style={styles.root}>
        {iconEntries.length > 0 ? iconEntries : i18n.noIconsFound()}
      </div>
    );
  }
});
module.exports = IconList;
