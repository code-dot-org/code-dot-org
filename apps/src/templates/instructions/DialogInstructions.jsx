import React from 'react';
import { connect } from 'react-redux';
import Instructions from './Instructions';
import msg from '../../locale';
var processMarkdown = require('marked');

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

    // not redux
    authoredHints: React.PropTypes.element
  },
  render() {
    const renderedMarkdown = this.props.longInstructions ?
      processMarkdown(this.props.longInstructions) : undefined;
    return (
      <Instructions
          puzzleTitle={msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
          instructions={this.props.shortInstructions}
          instructions2={this.props.shortInstructions2}
          renderedMarkdown={renderedMarkdown}
          aniGifUrl={this.props.aniGifUrl}
          authoredHints={this.props.authoredHints}
      />
    );
  }
});

export default connect(state => ({
  puzzleNumber: state.pageConstants.puzzleNumber,
  stageTotal: state.pageConstants.stageTotal,
  shortInstructions: state.instructions.shortInstructions,
  shortInstructions2: state.instructions.shortInstructions2,
  longInstructions: state.instructions.longInstructions,
  aniGifURL: state.pageConstants.aniGifURL,
}))(DialogInstructions);
