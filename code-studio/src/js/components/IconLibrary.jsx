/* global dashboard */

var IconList = require('./IconList.jsx');

/**
 * A component for managing icons.
 */
var IconLibrary = React.createClass({
  propTypes: {
    alignment: React.PropTypes.string,
    assetChosen: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {search: ''};
  },

  search: function (e) {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  },

  render: function () {
    var styles = {
      root: {
        float: this.props.alignment || 'right',
        position: 'relative',
        margin: '10px 0'
      },
      input: {
        width: '300px',
        border: '1px solid #999',
        borderRadius: '4px',
        padding: '3px 7px'
      },
      icon: {
        position: 'absolute',
        right: '5px',
        top: '5px',
        fontSize: '16px',
        color: '#999'
      }
    };

    return (
      <div>
        <div style={styles.root}>
          <input
            onChange={this.search}
            style={styles.input}
            placeholder={dashboard.i18n.t('components.icon_library.search_placeholder')}/>
          <i className="fa fa-search" style={styles.icon}/>
        </div>
        <IconList
          assetChosen={this.props.assetChosen}
          search={this.state.search}/>
      </div>
    );
  }
});
module.exports = IconLibrary;

window.dashboard = window.dashboard || {};
window.dashboard.IconLibrary = IconLibrary;
