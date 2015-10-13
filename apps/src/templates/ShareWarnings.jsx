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
    handleClose: React.PropTypes.func.isRequired,
    handleTooYoung: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return { modalIsOpen: this.props.signedIn || this.props.storesData };
  },

  handleOk: function() {
    if (this.props.signedIn) {
      this.props.handleClose();
      return;
    }

    var ageElement = React.findDOMNode(this.refs.age);
    if (ageElement.value === '') {
      // ignore close if we haven't selected a value from dropdown
      return;
    }

    var age = parseInt(ageElement.value, 10);
    if (age >= 13) {
      this.props.handleClose();
    } else {
      this.props.handleTooYoung();
    }

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

    // TODO - i18n
    var i18n = {
      storeDataMsg: 'This app built on Code Studio stores data that can be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information.',
      ageMsg: 'Please provide your age below and click OK to continue.',
      moreInfo: 'More Info',
      ok: 'OK'
    };

    var dataPrompt, agePrompt;
    if (this.props.storesData) {
      dataPrompt = <div style={styles.dataMessage}>{i18n.storeDataMsg}</div>;
    }
    if (!this.props.signedIn) {
      agePrompt = <div>
        <div style={styles.ageMessage}>{i18n.ageMsg}</div>
        <AgeDropdown style={styles.ageDropdonw} ref='age'/>
      </div>;
    }

    return (
      <div>
        {dataPrompt}
        {agePrompt}
        <div>
          <a style={styles.moreInfo} target="_blank" href="https://code.org/privacy">{i18n.moreInfo}</a>
          <button style={styles.ok} onClick={this.handleOk}>{i18n.ok}</button>
        </div>
      </div>
    );
  }
});
