var IconList = require('./IconList.jsx');
var msg = require('../locale');

/**
 * A component for managing icons.
 */
module.exports = React.createClass({
  propTypes: {
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
    return (
      <div>
        <div style={{float: 'right', position: 'relative', margin: '10px 0'}}>
          <input onChange={this.search} style={{
            width: '300px',
            border: '1px solid #999',
            borderRadius: '4px',
            padding: '3px 7px'
          }} placeholder={msg.iconSearchPlaceholder()}/>
          <i className="fa fa-search" style={{
            position: 'absolute',
            right: '5px',
            top: '5px',
            fontSize: '16px',
            color: '#999'
          }}/>
        </div>
        <IconList assetChosen={this.props.assetChosen} search={this.state.search}/>
      </div>
    );
  }
});
