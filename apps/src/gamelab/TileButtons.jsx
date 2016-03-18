'use strict';

var color = require('../color');

var TileButtons = React.createClass({
  render: function () {
    return <div style={{marginLeft: 4, marginRight: 4, marginTop: 6, textAlign: 'center', color: color.white, fontSize: 24}}>
      <i className="fa fa-trash-o" style={{marginRight: 12}}></i>
      <i className="fa fa-clone"></i>
    </div>;
  }
});
module.exports = TileButtons;
