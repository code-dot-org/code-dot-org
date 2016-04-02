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
    var bodyStyle = {
      marginBottom: '35px'
    };
    if (this.props.renderedMarkdown) {
      // Optionally give markdown dialog wide left margin so it looks more like a
      // non-markdown instructions dialog (useful if mixing markdown instructions
      // with non-markdown instructions in one tutorial).
      if (this.props.markdownClassicMargins) {
        bodyStyle.paddingTop = 0;
        bodyStyle.marginLeft = '90px';
      }

      body = (<div
        className='instructions-markdown'
        style={ bodyStyle }
        dangerouslySetInnerHTML={{__html: this.props.renderedMarkdown}}
      />);
    } else {
      bodyStyle.marginLeft = '80px';

      var instructions = (this.props.instructions) ?
        <p className='instructions' dangerouslySetInnerHTML={{__html: this.props.instructions}}/> :
        null;

      var instructions2 = (this.props.instructions2) ?
        <p className='instructions2' dangerouslySetInnerHTML={{__html: this.props.instructions2}}/> :
        null;

      body = (<div style={ bodyStyle }>
        <p className='dialog-title'>{ this.props.puzzleTitle }</p>
        {instructions}
        {instructions2}
      </div>);
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
