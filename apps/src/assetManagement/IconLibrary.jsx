var IconList = require('./IconList.jsx');

/**
 * A component for managing icons.
 */
module.exports = React.createClass({
  propTypes: {
  },

  getInitialState: function() {
    return {search: ''};
  },

  search: function (e) {
    this.setState({search: e.target.value});
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
          }}/>
          <i className="fa fa-search" style={{
            position: 'absolute',
            right: '5px',
            top: '5px',
            fontSize: '16px',
            color: '#999'
          }}/>
        </div>
        <IconList search={this.state.search}/>
      </div>
    );
  }
});
