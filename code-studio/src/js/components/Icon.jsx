/**
 * A single icon.
 */
var Icon = React.createClass({
  propTypes: {
    iconId: React.PropTypes.string.isRequired
  },

  render: function () {
    var styles = {
      root: {
        float: 'left',
        fontSize: '24px',
        width: '32px',
        textAlign: 'center'
      }
    };

    return (
      <i className={'fa fa-' + this.props.iconId} style={styles.root}/>
    );
  }
});
module.exports = Icon;

window.dashboard = window.dashboard || {};
window.dashboard.Icon = Icon;
