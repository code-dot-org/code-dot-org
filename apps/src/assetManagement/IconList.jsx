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

  render: function () {
    var letters = this.props.search.split(''), results = {};

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
      getResults(node, this.props.search);
    }

    var list = [];

    for (var iconId in results) {
      var result = results[iconId];
      list.push(<IconListEntry
        assetChosen={this.props.assetChosen}
        unicode={result.unicode}
        iconId={iconId}
        altMatch={result.alt}
        search={this.props.search}/>
      );
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
