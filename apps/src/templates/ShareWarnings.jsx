// TODO - probably not the final name

module.exports = React.createClass({
  propTypes: {
    signedIn: React.PropTypes.bool.isRequired,
    storesData: React.PropTypes.bool.isRequired,
    onClose: React.PropTypes.func.isRequired
  },

  render: function () {
    var storeDataMsg = 'This app built on Code Studio stores data that can be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information.';
    return (
      <div>
        <div>storeDataMsg</div>
        <button id='foo' onClick={this.props.onClose}>Foo</button>
      </div>
    );
  },

  componentDidMount: function () {
    $('.versionTimestamp').timeago();
  }
});
