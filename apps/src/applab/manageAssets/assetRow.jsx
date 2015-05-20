var React = require('react');

module.exports = React.createClass({
  propTypes: {
    name: React.PropTypes.instanceOf(String).isRequired
  },

  render: function () {
    return (
      <tr className="assetRow">
        <td><div className="assetThumbnail" style={{
          width: '60px', height: '60px', margin: '10px auto', background: '#eee', border: '1px solid #ccc'
        }}></div></td>
        <td>{this.props.name}</td>
        <td className="assetActions">
          <button className="btn-primary">Set as image</button>
          <button><i className="fa fa-eye"></i></button>
          <button><i className="fa fa-trash-o"></i></button>
        </td>
      </tr>
    );
  }
});
