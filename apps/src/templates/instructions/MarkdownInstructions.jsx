var styles = {
  main: {
    marginBottom: 35
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
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element
  },

  render: function () {
    return (
      <div>
        <div
          className='instructions-markdown'
          style={this.props.markdownClassicMargins ? styles.classic : styles.main}
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
