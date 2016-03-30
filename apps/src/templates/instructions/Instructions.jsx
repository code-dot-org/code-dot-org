var MarkdownInstructions = require('./MarkdownInstructions.jsx');
var NonMarkdownInstructions = require('./NonMarkdownInstructions.jsx');

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
    if (this.props.renderedMarkdown) {
      return (
        <MarkdownInstructions
          renderedMarkdown={this.props.renderedMarkdown}
          markdownClassicMargins={this.props.markdownClassicMargins}
          inTopPane={this.props.inTopPane}
          aniGifURL={this.props.aniGifURL}
          authoredHints={this.props.authoredHints}
        />
      );
    }

    return (
      <NonMarkdownInstructions
        puzzleTitle={this.props.puzzleTitle}
        instructions={this.props.instructions}
        instructions2={this.props.instructions2}
        aniGifURL={this.props.aniGifURL}
        authoredHints={this.props.authoredHints}
      />
    );
  }
});

module.exports = Instructions;
