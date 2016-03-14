var msg = require('../../locale');
var DialogButtons = require('../DialogButtons.jsx');

var ShowCode = React.createClass({
  
  propTypes: {
    generatedCodeComponent: React.PropTypes.element.isRequired
  },

  render: function () {
    return (<div>
      {this.props.generatedCodeComponent}
      <DialogButtons ok={true} />
    </div>);
  }
});
module.exports = ShowCode;
