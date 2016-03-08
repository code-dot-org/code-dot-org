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
        <input onChange={this.search}></input>
        <IconList search={this.state.search}/>
      </div>
    );
  }
});
