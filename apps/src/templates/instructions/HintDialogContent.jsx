var msg = require('../../locale');
var Lightbulb = require('../Lightbulb.jsx');
var ReadOnlyBlockSpace = require('../ReadOnlyBlockSpace.jsx');

var HintDialogContent = React.createClass({
  propTypes: {
    content: React.PropTypes.string.isRequired,
    block: React.PropTypes.object,
  },

  render: function () {
    var block;
    if (this.props.block) {
      block = (<ReadOnlyBlockSpace block={this.props.block} />);
    }

    return (<div>
      <h3>
        <Lightbulb size={32} style={{ margin: "-9px 5px -9px -5px" }}/>
        { msg.hintTitle() }
      </h3>
      <div dangerouslySetInnerHTML={{ __html: this.props.content }}/>
      {block}
    </div>);
  }
});

module.exports = HintDialogContent;
