var IconListEntry = require('./IconListEntry.jsx');
var icons = require('./icons').aliases;
var msg = require('../locale');

/**
 * A component for managing icons.
 */
var IconList = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    search: React.PropTypes.string.isRequired
  },

  getMatches: function () {
    var query = new RegExp('(^|-)' + this.props.search), results = {};

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
    var results = this.getMatches();

    var list = Object.keys(results).map(function (iconId) {
      return <IconListEntry
        key={iconId}
        assetChosen={this.props.assetChosen}
        iconId={iconId}
        altMatch={results[iconId]}
        search={this.props.search}/>;
    }.bind(this));

    if (list.length === 0) {
      list = msg.noIconsFound();
    }

    return (
      <div style={{
        height: '330px',
        overflowY: 'scroll',
        clear: 'both'
      }}>
        {list}
      </div>
    );
  }
});
module.exports = IconList;
