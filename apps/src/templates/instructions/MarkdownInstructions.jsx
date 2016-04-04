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

var MarkdownInstructions = function (props) {
  return (
    <div
      className='instructions-markdown'
      style={[
        styles.standard,
        props.inTopPane && styles.inTopPane,
        props.markdownClassicMargins && styles.classic
      ]}
      dangerouslySetInnerHTML={{ __html: props.renderedMarkdown }}/>
  );
};

MarkdownInstructions.propTypes = {
  renderedMarkdown: React.PropTypes.string.isRequired,
  markdownClassicMargins: React.PropTypes.bool,
  inTopPane: React.PropTypes.bool
};

module.exports = Radium(MarkdownInstructions);
