import PropTypes from 'prop-types';
import React from 'react';
import MarkdownInstructions from './MarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';

const styles = {
  inTopPane: {
    overflow: 'hidden'
  },
  notInTopPane: {
    overflow: 'auto'
  },
  standaloneTitle: {
    marginBottom: 35,
    marginLeft: 80
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
   * Long Instructions always take priority over Short Instructions.
   *
   * If we have been given either flavor of instructions, render a div
   * containing them, optionally with inline-styled margins. We don't need to
   * worry about the title in this case, as it is rendered by the Dialog header
   *
   * Otherwise, just render the title.
   */
  renderMainBody() {
    const instructions =
      this.props.longInstructions || this.props.shortInstructions;

    if (instructions) {
      return (
        <MarkdownInstructions
          markdown={instructions}
          onResize={this.props.onResize}
          inTopPane={this.props.inTopPane}
        />
      );
    } else {
      return (
        <div style={styles.standaloneTitle}>
          <p className="dialog-title">{this.props.puzzleTitle}</p>
        </div>
      );
    }
  }

  render() {
    return (
      <div
        style={this.props.inTopPane ? styles.inTopPane : styles.notInTopPane}
      >
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
