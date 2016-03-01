var ReadOnlyBlockSpace = require('./ReadOnlyBlockSpace.jsx');

var Hint = React.createClass({

  propTypes: {
    hint: React.PropTypes.object.isRequired
  },

  render: function () {
    var hintBlock;
    if (this.props.hint.block) {
      hintBlock = (<ReadOnlyBlockSpace block={this.props.hint.block} />);
    }
    return (<li style={{ marginBottom: '12px' }}>
      <div dangerouslySetInnerHTML={{ __html : this.props.hint.content }} />
      {hintBlock}
    </li>);
  },
});

module.exports = Hint;
