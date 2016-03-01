var msg = require('../locale');
var Lightbulb = require('./Lightbulb.jsx');

module.exports = React.createClass({
  propTypes: {
    renderedContent: React.PropTypes.string.isRequired,
  },
  render: function () {
    return (
      <div>
        <h3>
          <Lightbulb size={32} style={{ margin: "-9px 0 -9px -5px" }}/>
          { msg.hintTitle() }
        </h3>
        <div dangerouslySetInnerHTML={{ __html: this.props.renderedContent }}/>
      </div>
    );
  }
});

