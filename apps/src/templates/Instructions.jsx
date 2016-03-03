var Instructions = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    markdownClassicMargins: React.PropTypes.bool,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element
  },

  render: function () {

    // Body logic is as follows:
    //
    // If we have been given rendered markdown, render a div containing
    // that, optionally with inline-styled margins. We don't need to
    // worry about the title in this case, as it is rendered by the
    // Dialog header
    //
    // Otherwise, render the title and up to two sets of instructions.
    // These instructions may contain spans and images as determined by
    // StudioApp.substituteInstructionImages
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
      body = [<p key='dialog-title' className='dialog-title'>{ this.props.puzzleTitle }</p>];

      if (this.props.instructions) {
        body.push(<p key='instructions-1' dangerouslySetInnerHTML={{ __html: this.props.instructions }}/>);
      }

      if (this.props.instructions2) {
        body.push(<p key='instructions-2' className='instructions2' dangerouslySetInnerHTML={{ __html: this.props.instructions2 }}/>);
      }
    }

    var aniGif;
    if (this.props.aniGifURL) {
      aniGif = <img className="aniGif example-image" src={ this.props.aniGifURL }/>;
    }

    return (
      <div>
        {body}
        {aniGif}
        {this.props.authoredHints}
      </div>
    );
  }
});
module.exports = Instructions;
