import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import Instructions from './Instructions';
import msg from '@cdo/locale';
import processMarkdown from 'marked';
import renderer from "../../util/StylelessRenderer";

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
  };

  render() {
    const renderedMarkdown = this.props.longInstructions ?
      processMarkdown(this.props.longInstructions, { renderer }) : undefined;

    const showInstructions = !(this.props.imgOnly || this.props.hintsOnly);
    const showImg = !this.props.hintsOnly;
    return (
      <Instructions
        puzzleTitle={msg.puzzleTitle({
            stage_total: this.props.stageTotal,
            puzzle_number: this.props.puzzleNumber
          })}
        instructions={showInstructions ?  this.props.shortInstructions : undefined}
        instructions2={showInstructions ?  this.props.shortInstructions2 : undefined}
        renderedMarkdown={showInstructions ?  renderedMarkdown : undefined}
        imgURL={showImg ? this.props.imgURL : undefined}
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
  hintsOnly: state.instructionsDialog.hintsOnly
}))(DialogInstructions);
