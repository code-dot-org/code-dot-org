var msg = require('../locale');

var React = require('react');
var connect = require('react-redux').connect;
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var experiments = require('../experiments');

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

/**
 * Component for for potentially showing a completion button in applab.
 * Depending on props, this button (if it exists) will say "Finish", "Submit",
 * or "Unsubmit"
 */
var CompletionButton = React.createClass({
  propTypes: {
    isProjectLevel: React.PropTypes.bool.isRequired,
    isSubmittable: React.PropTypes.bool.isRequired,
    isSubmitted: React.PropTypes.bool.isRequired,
    playspacePhoneFrame: React.PropTypes.bool
  },

  render: function () {
    var id;
    var contents;
    var divClass = 'share-cell-none';

    if (this.props.isProjectLevel) {
      return <div/>;
    }

    if (this.props.isSubmittable) {
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
              id={id}
              className="share"
              style={[this.props.playspacePhoneFrame && styles.phoneFrameButton]}
          >
            <img src="/blockly/media/1x1.gif"/>
            {contents}
          </button>
        </div>
      </ProtectedStatefulDiv>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    isProjectLevel: state.pageConstants.isProjectLevel,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted,
    playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
  };
})(CompletionButton);

module.exports.styles = styles;

module.exports.__TestInterface__ = {
  UnconnectedCompletionButton: CompletionButton
};
