import PropTypes from 'prop-types';
import React from 'react';
import MarkdownInstructions from './MarkdownInstructions';
import InputOutputTable from './InputOutputTable';
import AniGifPreview from './AniGifPreview';
import ImmersiveReaderButton from './ImmersiveReaderButton';
import ExampleImage from './ExampleImage';
import i18n from '@cdo/locale';

/**
 * A component for displaying our level instructions text, and possibly also
 * authored hints UI and/or an anigif. These instructions can appear in the top
 * pane or in a modal dialog. In the latter case, we will sometimes show just
 * the anigif (in this case the instructions prop may be undefined).
 */
export default class Instructions extends React.Component {
  static propTypes = {
    instructions: PropTypes.string,
    imgURL: PropTypes.string,
    authoredHints: PropTypes.element,
    inputOutputTable: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    inTopPane: PropTypes.bool,
    onResize: PropTypes.func,
    isBlockly: PropTypes.bool,
    isImmersiveButtonHasRoundBorders: PropTypes.bool,
    // TODO: [Phase 2] This is a switch for legacy styles needed to revert Javalab rebranding changes.
    //  once we update Javalab to new styles we'll need to remove this prop and all of it's usage
    //  more info here: https://github.com/code-dot-org/code-dot-org/pull/50924
    isLegacyImmersiveStyles: PropTypes.bool,
    noInstructionsWhenCollapsed: PropTypes.bool,
  };

  render() {
    const {
      inTopPane,
      instructions,
      onResize,
      isBlockly,
      isImmersiveButtonHasRoundBorders,
      isLegacyImmersiveStyles,
      noInstructionsWhenCollapsed,
      inputOutputTable,
      imgURL,
      authoredHints,
    } = this.props;

    return (
      <div style={inTopPane ? styles.inTopPane : styles.notInTopPane}>
        {instructions && (
          <>
            <ImmersiveReaderButton
              title={i18n.instructions()}
              text={instructions}
              hasRoundBorders={isImmersiveButtonHasRoundBorders}
              isLegacyStyles={isLegacyImmersiveStyles}
            />
            <MarkdownInstructions
              markdown={instructions}
              onResize={onResize}
              inTopPane={inTopPane}
              isBlockly={isBlockly}
              noInstructionsWhenCollapsed={noInstructionsWhenCollapsed}
            />
          </>
        )}
        {inputOutputTable && <InputOutputTable data={inputOutputTable} />}
        {imgURL && !inTopPane && <ExampleImage src={imgURL} />}
        {imgURL && inTopPane && <AniGifPreview />}
        {authoredHints}
      </div>
    );
  }
}

const styles = {
  inTopPane: {
    overflow: 'hidden',
  },
  notInTopPane: {
    overflow: 'auto',
  },
};
