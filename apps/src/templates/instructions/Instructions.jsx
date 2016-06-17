var React = require('react');
var MarkdownInstructions = require('./MarkdownInstructions');
var NonMarkdownInstructions = require('./NonMarkdownInstructions');
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';

const styles = {
  main: {
    overflow: 'auto'
  }
};

var Instructions = React.createClass({

  propTypes: {
    puzzleTitle: React.PropTypes.string,
    instructions: React.PropTypes.string,
    instructions2: React.PropTypes.string,
    renderedMarkdown: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    authoredHints: React.PropTypes.element,
    inputOutputTable: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(React.PropTypes.number)
    ),
    inTopPane: React.PropTypes.bool,
    onResize: React.PropTypes.func
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
    // substituteInstructionImages

    return (
      <div style={styles.main}>
        {this.props.renderedMarkdown &&
          <MarkdownInstructions
              ref="instructionsMarkdown"
              renderedMarkdown={this.props.renderedMarkdown}
              onResize={this.props.onResize}
              inTopPane={this.props.inTopPane}
          />
        }
        {!this.props.renderedMarkdown &&
          <NonMarkdownInstructions
              puzzleTitle={this.props.puzzleTitle}
              instructions={this.props.instructions}
              instructions2={this.props.instructions2}
          />
        }
        {this.props.inputOutputTable &&
          <InputOutputTable data={this.props.inputOutputTable}/>
        }
        {this.props.aniGifURL && !this.props.inTopPane &&
          <img className="aniGif example-image" src={this.props.aniGifURL}/>
        }
        {this.props.aniGifURL && this.props.inTopPane &&
          <AniGifPreview/>
        }
        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = Instructions;
