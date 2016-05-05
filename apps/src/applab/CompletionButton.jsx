var msg = require('../locale');

var connect = require('react-redux').connect;
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var styles = {
  main: {
    display: 'inline'
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
          <button id={id} className="share">
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
  };
})(CompletionButton);

module.exports.__TestInterface__ = {
  UnconnectedCompletionButton: CompletionButton
};
