var Radium = require('radium');

var styles = {
  standard: {
    marginBottom: 35,
    paddingTop: 19
  },
  inTopPane: {
    marginBottom: 35,
    paddingTop: 0
  },
  // Optionally give markdown dialog wide left margin so it looks more like a
  // non-markdown instructions dialog (useful if mixing markdown instructions
  // with non-markdown instructions in one tutorial).
  classic: {
    marginBottom: 35,
    paddingTop: 0,
    marginLeft: 90
  }
};

const MarkdownInstructions = React.createClass({
  propTypes: {
    renderedMarkdown: React.PropTypes.string.isRequired,
    markdownClassicMargins: React.PropTypes.bool,
    inTopPane: React.PropTypes.bool
  },

  componentDidMount() {
    $('details').details();
  },

  render() {
    const { inTopPane, renderedMarkdown, markdownClassicMargins } = this.props;
    return (
      <div
        className='instructions-markdown'
        style={[
          styles.standard,
          inTopPane && styles.inTopPane,
          markdownClassicMargins && styles.classic
        ]}
        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}/>
    );
  }
});

module.exports = Radium(MarkdownInstructions);
