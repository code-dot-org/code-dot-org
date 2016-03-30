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

var MarkdownInstructions = React.createClass({

  propTypes: {
    renderedMarkdown: React.PropTypes.string.isRequired,
    markdownClassicMargins: React.PropTypes.bool,
    inTopPane: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element
  },

  render: function () {
    var style = styles.standard;
    if (this.props.inTopPane) {
      style = styles.inTopPane;
    } else if (this.props.mardownClassicMargins) {
      style = styles.classic;
    }

    return (
      <div>
        <div
          className='instructions-markdown'
          style={style}
          dangerouslySetInnerHTML={{ __html: this.props.renderedMarkdown }}/>
        {this.props.aniGifURL &&
          <img className="aniGif example-image" src={ this.props.aniGifURL }/>
        }
        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = MarkdownInstructions;
