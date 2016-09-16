import React from 'react';
import { connect } from 'react-redux';
import Instructions from './Instructions';
import msg from '@cdo/locale';
import processMarkdown from '../../MarkdownRenderer';

/**
 * Component for displaying our instructions in the context of a modal dialog
 */
const DialogInstructions = React.createClass({
  propTypes: {
    // redux
    puzzleNumber: React.PropTypes.number.isRequired,
    stageTotal: React.PropTypes.number.isRequired,
    shortInstructions: React.PropTypes.string.isRequired,
    shortInstructions2: React.PropTypes.string,
    longInstructions: React.PropTypes.string,
    aniGifURL: React.PropTypes.string,
    aniGifOnly: React.PropTypes.bool,
    hintsOnly: React.PropTypes.bool,
    acapelaInstructionsSrc: React.PropTypes.string,
    acapelaMarkdownInstructionsSrc:  React.PropTypes.string,

    // not redux
    authoredHints: React.PropTypes.element
  },
  render() {
    const renderedMarkdown = this.props.longInstructions ?
      processMarkdown(this.props.longInstructions) : undefined;
    const acapelaSrc = this.props.longInstructions ?
      this.props.acapelaMarkdownInstructionsSrc : this.props.acapelaInstructionsSrc;

    const showInstructions = !(this.props.aniGifOnly || this.props.hintsOnly);
    const showAniGif = !this.props.hintsOnly;
    const showHints = !this.props.aniGifOnly;
    return (
      <Instructions
        puzzleTitle={msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
        acapelaSrc={showInstructions ? acapelaSrc : undefined}
        instructions={showInstructions ?  this.props.shortInstructions : undefined}
        instructions2={showInstructions ?  this.props.shortInstructions2 : undefined}
        renderedMarkdown={showInstructions ?  renderedMarkdown : undefined}
        aniGifURL={showAniGif ? this.props.aniGifURL : undefined}
        authoredHints={showHints ? this.props.authoredHints : undefined}
      />
    );
  }
});

export default connect(state => ({
  acapelaInstructionsSrc: state.pageConstants.acapelaInstructionsSrc,
  acapelaMarkdownInstructionsSrc: state.pageConstants.acapelaMarkdownInstructionsSrc,
  puzzleNumber: state.pageConstants.puzzleNumber,
  stageTotal: state.pageConstants.stageTotal,
  shortInstructions: state.instructions.shortInstructions,
  shortInstructions2: state.instructions.shortInstructions2,
  longInstructions: state.instructions.longInstructions,
  aniGifURL: state.pageConstants.aniGifURL,
  aniGifOnly: state.instructionsDialog.aniGifOnly,
  hintsOnly: state.instructionsDialog.hintsOnly
}))(DialogInstructions);
