import PropTypes from 'prop-types';
import React from 'react';
import MarkdownInstructions from './MarkdownInstructions';
import NonMarkdownInstructions from './NonMarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';
import ImmersiveReaderButton from './ImmersiveReaderButton';
import i18n from '@cdo/locale';

const styles = {
  inTopPane: {
    overflow: 'hidden'
  },
  notInTopPane: {
    overflow: 'auto'
  }
};

/**
 * A component for displaying our level instructions text, and possibly also
 * authored hints UI and/or an anigif. These instructions can appear in the top
 * pane or in a modal dialog. In the latter case, we will sometimes show just
 * the hints or just the anigif (in this case instructions/longInstructions
 * props will be undefined).
 */
class Instructions extends React.Component {
  static propTypes = {
    puzzleTitle: PropTypes.string,
    shortInstructions: PropTypes.string,
    instructions2: PropTypes.string,
    longInstructions: PropTypes.string,
    imgURL: PropTypes.string,
    authoredHints: PropTypes.element,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    inTopPane: PropTypes.bool,
    onResize: PropTypes.func
  };

  /**
   * Body logic is as follows:
   *
   * If we have been given long instructions, render a div containing
   * that, optionally with inline-styled margins. We don't need to
   * worry about the title in this case, as it is rendered by the
   * Dialog header
   *
   * Otherwise, render the title and up to two sets of instructions.
   * These instructions may contain spans and images as determined by
   * substituteInstructionImages
   */
  renderMainBody() {
    if (this.props.longInstructions) {
      return (
        <MarkdownInstructions
          markdown={this.props.longInstructions}
          onResize={this.props.onResize}
          inTopPane={this.props.inTopPane}
        />
      );
    } else {
      // Note: In this case props.shortInstructions might be undefined, but we
      // still want to render NonMarkdownInstructions to get the puzzle title
      return (
        <NonMarkdownInstructions
          puzzleTitle={this.props.puzzleTitle}
          shortInstructions={this.props.shortInstructions}
          instructions2={this.props.instructions2}
        />
      );
    }
  }

  render() {
    return (
      <div
        style={this.props.inTopPane ? styles.inTopPane : styles.notInTopPane}
      >
        <ImmersiveReaderButton
          title={this.props.puzzleTitle || i18n.instructions()}
          text={this.props.longInstructions || this.props.shortInstructions}
        />
        {this.renderMainBody()}

        {this.props.inputOutputTable && (
          <InputOutputTable data={this.props.inputOutputTable} />
        )}

        {this.props.imgURL && !this.props.inTopPane && (
          <img className="aniGif example-image" src={this.props.imgURL} />
        )}
        {this.props.imgURL && this.props.inTopPane && <AniGifPreview />}
        {this.props.authoredHints}
      </div>
    );
  }
}

module.exports = Instructions;
