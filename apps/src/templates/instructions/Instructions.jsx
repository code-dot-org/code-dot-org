import React, {PropTypes} from 'react';
import MarkdownInstructions from './MarkdownInstructions';
import NonMarkdownInstructions from './NonMarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';

const styles = {
  inTopPane: {
    overflow: 'hidden'
  },
  notInTopPane: {
    overflow: 'auto'
  },
};

/**
 * A component for displaying our level instructions text, and possibly also
 * authored hints UI and/or an anigif. These instructions can appear in the top
 * pane or in a modal dialog. In the latter case, we will sometimes show just
 * the hints or just the anigif (in this case instructions/renderedMarkdown
 * props will be undefined).
 */
var Instructions = React.createClass({
  propTypes: {
    puzzleTitle: PropTypes.string,
    instructions: PropTypes.string,
    instructions2: PropTypes.string,
    renderedMarkdown: PropTypes.string,
    imgURL: PropTypes.string,
    authoredHints: PropTypes.element,
    inputOutputTable: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.number)
    ),
    inTopPane: PropTypes.bool,
    onResize: PropTypes.func,
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
      <div style={this.props.inTopPane ? styles.inTopPane : styles.notInTopPane}>
        {this.props.renderedMarkdown &&
          <MarkdownInstructions
            ref="instructionsMarkdown"
            renderedMarkdown={this.props.renderedMarkdown}
            onResize={this.props.onResize}
            inTopPane={this.props.inTopPane}
          />
        }
        { /* Note: In this case props.instructions might be undefined, but we
          still want to render NonMarkdownInstructions to get the puzzle title */
        !this.props.renderedMarkdown &&
          <NonMarkdownInstructions
            puzzleTitle={this.props.puzzleTitle}
            instructions={this.props.instructions}
            instructions2={this.props.instructions2}
          />
        }

        {this.props.inputOutputTable &&
          <InputOutputTable data={this.props.inputOutputTable}/>
        }

        {this.props.imgURL && !this.props.inTopPane &&
          <img className="aniGif example-image" src={this.props.imgURL}/>
        }
        {this.props.imgURL && this.props.inTopPane &&
          <AniGifPreview/>
        }
        {this.props.authoredHints}
      </div>
    );
  }
});

module.exports = Instructions;
