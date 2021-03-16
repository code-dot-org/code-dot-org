import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownInstructions from './MarkdownInstructions';
import NonMarkdownInstructions from './NonMarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';
import ImmersiveReaderButton from './ImmersiveReaderButton';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';

const HEADER_HEIGHT = styleConstants['workspace-headers-height'];
const RESIZER_HEIGHT = styleConstants['resize-bar-width'];

const styles = {
  inTopPane: {
    overflow: 'hidden'
  },
  notInTopPane: {
    overflow: 'auto'
  },
  dynamicInstructions: {}
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
    dynamicInstructions: PropTypes.object,
    dynamicInstructionsKey: PropTypes.string,
    imgURL: PropTypes.string,
    authoredHints: PropTypes.element,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    inTopPane: PropTypes.bool,
    onResize: PropTypes.func,
    isBlockly: PropTypes.bool,
    noInstructionsWhenCollapsed: PropTypes.bool,
    setInstructionsRenderedHeight: PropTypes.func
  };

  state = {
    dynamicInstructionsHeight: null
  };

  constructor(props) {
    super(props);

    this.dynamicInstructionsRefs = {};
  }

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
          isBlockly={this.props.isBlockly}
          noInstructionsWhenCollapsed={this.props.noInstructionsWhenCollapsed}
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

  componentDidMount() {
    let largestHeight = 0;

    // Find the tallest of our dynamic instructions.
    if (this.props.dynamicInstructions) {
      Object.keys(this.props.dynamicInstructions).forEach(key => {
        const height = $(
          ReactDOM.findDOMNode(this.dynamicInstructionsRefs[key])
        ).outerHeight(true);
        if (height > largestHeight) {
          largestHeight = height;
        }
      });
    }

    // Resize the parent div to be the height of the largest dynamic instruction.
    if (this.props.setInstructionsRenderedHeight) {
      this.props.setInstructionsRenderedHeight(
        largestHeight + HEADER_HEIGHT + RESIZER_HEIGHT + 20 + 10
      );
    }
  }

  render() {
    const parentStyle = this.props.dynamicInstructions
      ? styles.dynamicInstructions
      : this.props.inTopPane
      ? styles.inTopPane
      : styles.notInTopPane;

    const immersiveReaderText =
      (this.props.dynamicInstructions &&
        this.props.dynamicInstructions[this.props.dynamicInstructionsKey]) ||
      this.props.longInstructions ||
      this.props.shortInstructions;

    return (
      <div style={parentStyle}>
        <ImmersiveReaderButton
          title={this.props.puzzleTitle || i18n.instructions()}
          text={immersiveReaderText}
        />
        {this.props.dynamicInstructions && (
          <div
            style={{
              marginTop: 10,
              position: 'relative',
              height: this.state.dynamicInstructionsHeight
            }}
          >
            {Object.keys(this.props.dynamicInstructions).map(key => {
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    opacity: key === this.props.dynamicInstructionsKey ? 1 : 0
                  }}
                  key={key}
                  ref={ref => (this.dynamicInstructionsRefs[key] = ref)}
                >
                  <div>{this.props.dynamicInstructions[key]}</div>
                  <div style={{clear: 'both'}} />
                </div>
              );
            })}
          </div>
        )}

        {!this.props.dynamicInstructions && (
          <div>
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
        )}
      </div>
    );
  }
}

module.exports = Instructions;
