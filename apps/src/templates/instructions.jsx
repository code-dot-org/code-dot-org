var msg = require('../locale');

module.exports = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    authoredHints: React.PropTypes.array,
    markdownClassicMargins: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string
  },

  render: function () {

    // The logic here needs some serious cleanup
    var body;
    if (this.props.renderedMarkdown) {
      body = (<div 
        className={ this.props.markdownClassicMargins ? "instructions-markdown classic-margins" : "instructions-markdown" }
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
          <h1>{ msg.hintReviewTitle() }</h1>
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
