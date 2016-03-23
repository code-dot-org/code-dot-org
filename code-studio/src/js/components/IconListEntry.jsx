var Icon = require('./Icon.jsx');

/**
 * A list of icons, maybe filtered by a search query.
 */
var IconListEntry = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    iconId: React.PropTypes.string.isRequired,
    altMatch: React.PropTypes.string.isRequired,
    query: React.PropTypes.instanceOf(RegExp).isRequired,
    search: React.PropTypes.string.isRequired
  },

  highlightSearch: function (str) {
    var offset = str.indexOf(this.props.search);
    if (offset === -1) {
      return str;
    }
    var left = str.substr(0, offset);
    var right = str.substr(offset + this.props.search.length);
    return (
      <span>
        {left}
        <span style={{backgroundColor: '#ffc'}}>{this.props.search}</span>
        {right}
      </span>
    );
  },

  render: function () {
    var styles = {
      altMatchText: {
        float: 'left',
        fontSize: '13px',
        color: '#999'
      },
      iconLabel: {
        float: 'left',
        margin: '0 5px',
        fontSize: '13px',
        color: '#000'
      }
    };

    var iconLabel, columnWidth, altMatchText;

    if (this.props.search) {
      columnWidth = '33%';

      var highlightedName = this.props.iconId;
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

      iconLabel = <div>
        <p style={styles.iconLabel}>{highlightedName}</p>
        {altMatchText}
      </div>;
    }

    var rootStyles = {
      float: 'left',
      width: columnWidth,
      height: '35px',
      cursor: 'pointer'
    };

    var asset = 'fa-' + this.props.iconId;

    return (
      <div
        style={rootStyles}
        title={this.props.iconId}
        onClick={this.props.assetChosen.bind(null, asset)}>
        <Icon iconId={this.props.iconId}/>
        {iconLabel}
      </div>
    );
  }
});
module.exports = IconListEntry;

window.dashboard = window.dashboard || {};
window.dashboard.IconListEntry = IconListEntry;
