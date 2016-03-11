var IconListEntry = require('./IconListEntry.jsx');
var icons = require('./icons');

/**
 * A component for managing icons.
 */
module.exports = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    search: React.PropTypes.string.isRequired
  },

  getMatches: function (query) {
    var letters = query.split(''), results = {};

    for (var i = 0, node = icons; i < letters.length; i++) {
      node = node[letters[i]];
      if (!node) {
        // No matches found
        break;
      }
    }

    // Construct results
    function getResults(node, prefix) {
      if (node.$) {
        for (var iconId in node.$) {
          results[iconId] = {
            unicode: node.$[iconId],
            alt: prefix
          };
        }
      }
      for (var letter in node) {
        if (letter !== '$') {
          getResults(node[letter], prefix + letter);
        }
      }
    }

    if (node) {
      getResults(node, query);
    }

    return results;
  },

  render: function () {
    var tokens = this.props.search.split('-'),
      query = this.props.search,
      results = this.getMatches(tokens[0]);

    if (tokens.length > 1) {
      var filtered = {};
      Object.keys(results).forEach(function (key) {
        if (key.indexOf(query) > -1) {
          filtered[key] = results[key];
        }
      });
      results = filtered;
    }

    var list = Object.keys(results).map(function (iconId) {
      var result = results[iconId];
      return <IconListEntry
        assetChosen={this.props.assetChosen}
        unicode={result.unicode}
        iconId={iconId}
        altMatch={result.alt}
        search={this.props.search}/>;
    }.bind(this));

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
