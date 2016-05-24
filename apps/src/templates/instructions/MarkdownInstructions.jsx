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

  enableDetails_() {
    // If we have the jQuery details plugin, enable its usage on any details
    // elements
    const detailsDOM = $(ReactDOM.findDOMNode(this)).find('details');
    if (detailsDOM.details) {
      detailsDOM.details();
    }
  },

  componentDidMount() {
    this.enableDetails_();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.renderedMardown !== this.props.renderedMarkdown) {
      this.enableDetails_();
    }
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
