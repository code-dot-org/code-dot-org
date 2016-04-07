var AnimationPickerBody = require('./AnimationPickerBody.jsx');
var Dialog = require('../../templates/DialogComponent.jsx');

var AnimationPicker = React.createClass({
  propTypes: {
    handleClose: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <Dialog handleClose={this.props.handleClose} isOpen>
        <AnimationPickerBody />
      </Dialog>
    );
  }
});
module.exports = AnimationPicker;
