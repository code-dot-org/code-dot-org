module.exports = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    authoredHints: React.PropTypes.array,
    markdownClassicMargins: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string,
    hintReviewTitle: React.PropTypes.string
  },

  render: function () {

    // The logic here needs some serious cleanup
    var body;
    if (this.props.renderedMarkdown) {
      // Optionally give markdown dialog wide left margin so it looks more like a
      // non-markdown instructions dialog (useful if mixing markdown instructions
      // with non-markdown instructions in one tutorial).
      var bodyStyle = (this.props.markdownClassicMargins) ? {
        paddingTop: 0,
        marginLeft: '90px'
      } : {};

      body = (<div 
        className='instructions-markdown'
        style={ bodyStyle }
        dangerouslySetInnerHTML={{ __html: this.props.renderedMarkdown }}
      />);
    } else {
      body = [<p className='dialog-title'>{ this.props.puzzleTitle }</p>];

      if (this.props.instructions) {
        body.push(<p dangerouslySetInnerHTML={{ __html: this.props.instructions }}/>);
      }

      if (this.props.instructions2) {
        body.push(<p className='instructions2' dangerouslySetInnerHTML={{ __html: this.props.instructions2 }}/>);
      }
    }

    var aniGif;
    if (this.props.aniGifURL) {
      aniGif = <img className="aniGif example-image" src={ this.props.aniGifURL }/>;
    }

    var authoredHints;
    if (this.props.authoredHints && this.props.authoredHints.length) {
      authoredHints = (
        <div className="authored-hints">
          <h1>{ this.props.hintReviewTitle }</h1>
          {this.props.authoredHints.map(function (hint) {
            return <div dangerouslySetInnerHTML={{ __html : hint.content }} />;
          })}
        </div>
      );
    }

    return (
      <div className='instructions-container'>
        {body}
        {aniGif}
        {authoredHints}
      </div>
    );
  }
});
