/**
 * A component for managing icons.
 */
module.exports = React.createClass({
  propTypes: {
    unicode: React.PropTypes.string.isRequired,
    iconId: React.PropTypes.string.isRequired,
    altMatch: React.PropTypes.string.isRequired,
    search: React.PropTypes.string.isRequired
  },

  highlightSearch: function (str) {
    var offset = str.indexOf(this.props.search);
    if (offset === -1) {
      return str;
    }
    var left = str.substr(0, offset), right = str.substr(offset + this.props.search.length);
    return [left, <span style={{backgroundColor: '#ffc'}}>{this.props.search}</span>, right];
  },

  render: function () {

    var query = new RegExp(this.props.search), altMatchText;
    if (!query.test(this.props.iconId)) {
      // We matched based on an alternate keyword, show that keyword next to the icon ID.
      altMatchText = <p style={{float: 'left', fontSize: '13px', color: '#999'}}>({this.highlightSearch(this.props.altMatch)})</p>;
    }

    return (
      <div style={{float: 'left', width: '33%', height: '35px'}}>
        <i className={'fa fa-' + this.props.iconId} style={{
          float: 'left',
          fontSize: '24px',
          width: '32px',
          textAlign: 'center'
        }}/>
        <p style={{float: 'left', margin: '0 5px', fontSize: '13px', color: '#000'}}>{this.highlightSearch(this.props.iconId)}</p>
        {altMatchText}
      </div>
    );
  }
});
