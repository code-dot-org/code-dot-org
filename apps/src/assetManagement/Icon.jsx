/**
 * A single icon.
 */
module.exports = React.createClass({
  propTypes: {
    iconId: React.PropTypes.string.isRequired
  },

  render: function () {

    return (
      <i className={'fa fa-' + this.props.iconId} style={{
        float: 'left',
        fontSize: '24px',
        width: '32px',
        textAlign: 'center'
      }}/>
    );
  }
});
