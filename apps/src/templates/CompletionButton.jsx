import msg from '@cdo/locale';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';

/**
 * Component for for potentially showing a completion button in applab.
 * Depending on props, this button (if it exists) will say "Finish", "Submit",
 * or "Unsubmit"
 */
class CompletionButton extends Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isSubmittable: PropTypes.bool.isRequired,
    isSubmitted: PropTypes.bool.isRequired,
    playspacePhoneFrame: PropTypes.bool
  };

  render() {
    let id;
    let contents;
    let divClass = 'share-cell-none';

    if (this.props.isProjectLevel) {
      return <div />;
    }

    if (this.props.isSubmittable || this.props.isSubmitted) {
      if (this.props.isSubmitted) {
        id = 'unsubmitButton';
        contents = msg.unsubmit();
        divClass = 'share-cell-enabled';
      } else {
        id = 'submitButton';
        contents = msg.submit();
      }
    } else {
      id = 'finishButton';
      contents = msg.finish();
    }

    return (
      <ProtectedStatefulDiv style={styles.main}>
        <div id="share-cell" className={divClass}>
          <button
            type="button"
            id={id}
            className="share"
            style={[this.props.playspacePhoneFrame && styles.phoneFrameButton]}
          >
            <img src="/blockly/media/1x1.gif" />
            {contents}
          </button>
        </div>
      </ProtectedStatefulDiv>
    );
  }
}

const styles = {
  main: {
    display: 'inline'
  },
  // The way that this works in the non-phone frame world is use media queries to
  // set runButton's min-width to be 111px at >1051, and 45px otherwise. When
  // min-width was 45px, we would actually render at 105px.
  // In phone frame, there's no reason to resize based on screen width since we
  // don't need to make room for more buttons on the same row. I've decided the
  // 105px looks better than 11px so I'm going with that.
  phoneFrameButton: {
    minWidth: 105,
    textAlign: 'center'
  }
};

export const UnconnectedCompletionButton = CompletionButton;

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isSubmittable: state.pageConstants.isSubmittable,
  isSubmitted: state.pageConstants.isSubmitted,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
}))(CompletionButton);

export {styles};
