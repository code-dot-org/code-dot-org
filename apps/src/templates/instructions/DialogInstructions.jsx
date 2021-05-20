import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Instructions from './Instructions';
import msg from '@cdo/locale';

/**
 * Component for displaying our instructions in the context of a modal dialog
 */
class DialogInstructions extends React.Component {
  static propTypes = {
    // redux
    puzzleNumber: PropTypes.number.isRequired,
    stageTotal: PropTypes.number.isRequired,
    shortInstructions: PropTypes.string.isRequired,
    shortInstructions2: PropTypes.string,
    longInstructions: PropTypes.string,
    imgURL: PropTypes.string,
    imgOnly: PropTypes.bool,
    hintsOnly: PropTypes.bool,
    isBlockly: PropTypes.bool,
    noInstructionsWhenCollapsed: PropTypes.bool
  };

  render() {
    const showInstructions = !(this.props.imgOnly || this.props.hintsOnly);
    const showImg = !this.props.hintsOnly;
    return (
      <Instructions
        puzzleTitle={msg.puzzleTitle({
          stage_total: this.props.stageTotal,
          puzzle_number: this.props.puzzleNumber
        })}
        shortInstructions={
          showInstructions ? this.props.shortInstructions : undefined
        }
        instructions2={
          showInstructions ? this.props.shortInstructions2 : undefined
        }
        longInstructions={
          showInstructions ? this.props.longInstructions : undefined
        }
        imgURL={showImg ? this.props.imgURL : undefined}
        isBlockly={this.props.isBlockly}
        noInstructionsWhenCollapsed={this.props.noInstructionsWhenCollapsed}
      />
    );
  }
}

export const UnconnectedDialogInstructions = DialogInstructions;
export default connect(state => ({
  puzzleNumber: state.pageConstants.puzzleNumber,
  stageTotal: state.pageConstants.stageTotal,
  shortInstructions: state.instructions.shortInstructions,
  shortInstructions2: state.instructions.shortInstructions2,
  longInstructions: state.instructions.longInstructions,
  imgURL: state.instructionsDialog.imgUrl || state.pageConstants.aniGifURL,
  imgOnly: state.instructionsDialog.imgOnly,
  hintsOnly: state.instructionsDialog.hintsOnly,
  isBlockly: state.pageConstants.isBlockly,
  noInstructionsWhenCollapsed: state.instructions.noInstructionsWhenCollapsed
}))(DialogInstructions);
