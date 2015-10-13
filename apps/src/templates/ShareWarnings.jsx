// TODO - probably not the final name

var AgeDropdown = require('./AgeDropdown.jsx');
// var Modal = require('react-modal');

// TODO - share this somewhere
var colors = {
  green: '#b9bf15',
  white: 'white',
  orange: '#ffa400'
};

var SharingWarnings = module.exports = React.createClass({
  propTypes: {
    signedIn: React.PropTypes.bool.isRequired,
    storesData: React.PropTypes.bool.isRequired,
    handleClose: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modalIsOpen: true };
  },

  handleOk: function() {
    //TODO - validate
    var ageElement = React.findDOMNode(this.refs.age);
    if (ageElement.value !== '') {
      this.props.handleClose();
    }
  },

  handleMoreInfo: function () {
    console.log('clicked more info - TODO');
  },

  render: function () {
    var styles = {
      dataMessage: {
        fontSize: 18,
        marginBottom: 30
      },
      ageMessage: {
        fontSize: 18,
        marginBottom: 10
      },
      ageDropdown: {

      },
      moreInfo: {
        marginLeft: 0
      },
      ok: {
        backgroundColor: colors.orange,
        border: '1px solid ' + colors.orange,
        color: colors.white,
        float: 'right'
      }
    };

    var storeDataMsg = 'This app built on Code Studio stores data that can be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information.';
    var ageMsg = 'Please provide your age below and click OK to continue.';
    return (
      <div>
        <div style={styles.dataMessage}>{storeDataMsg}</div>
        <div style={styles.ageMessage}>{ageMsg}</div>
        <AgeDropdown style={styles.ageDropdonw} ref='age'/>
        <div>
          <a style={styles.moreInfo} onClick={this.handleMoreInfo}>More Info</a>
          <button style={styles.ok} onClick={this.handleOk}>OK</button>
        </div>
      </div>
    );
  }
});
