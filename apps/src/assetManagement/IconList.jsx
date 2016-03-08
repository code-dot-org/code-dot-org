var IconListEntry = require('./IconListEntry.jsx');

var icons = require('./icons');
var iconKeys = Object.keys(icons);
var MAX_RESULTS = 50;

/**
 * A component for managing icons.
 */
module.exports = React.createClass({
  propTypes: {
    search: React.PropTypes.string.isRequired
  },

  render: function () {
    var query = new RegExp('(^|-)' + this.props.search), results = {};

    for (var i = 0; i < iconKeys.length; i++) {
      var keyword = iconKeys[i];
      if (query.test(keyword)) {
        var matches = icons[keyword];
        for (var match in matches) {
          if (!results[match]) {
            results[match] = {
              unicode: matches[match],
              alt: keyword
            };
          }
        }
      }
    }

    var list = [];

    for (var iconId in results) {
      var result = results[iconId];
      list.push(<IconListEntry
        unicode={result.unicode}
        iconId={iconId}
        altMatch={result.alt}
        search={this.props.search}/>
      );
    }

    return (
      <div>
        {list}
      </div>
    );
  }
});
