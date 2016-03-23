/* global dashboard */

var IconListEntry = require('./IconListEntry.jsx');
var icons = require('./icons').aliases;
dashboard.iconsUnicode = require('./icons').unicode;

/**
 * A component for managing icons.
 */
var IconList = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    search: React.PropTypes.string.isRequired
  },

  getMatches: function (query) {
    var results = {};

    Object.keys(icons).forEach(function (alias) {
      if (query.test(alias)) {
        icons[alias].forEach(function (match) {
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
      return <IconListEntry
        key={iconId}
        assetChosen={this.props.assetChosen}
        iconId={iconId}
        altMatch={results[iconId]}
        query={query}
        search={this.props.search}/>;
    }.bind(this));

    return (
      <div style={styles.root}>
        {iconEntries.length > 0 ? iconEntries : dashboard.i18n.t('components.icon_library.no_icons_found')}
      </div>
    );
  }
});
module.exports = IconList;

window.dashboard = window.dashboard || {};
window.dashboard.IconList = IconList;
