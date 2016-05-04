var Radium = require('radium');
var applabConstants = require('./constants');
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
var connect = require('react-redux').connect;

var styles = {
  nonResponsive: {
    width: applabConstants.APP_WIDTH,
    height: applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT
  },
  share: {
    // overrides nonReponsive
    height: applabConstants.APP_HEIGHT
  }
};


var Visualization = React.createClass({
  propTypes: {
    visualizationHasPadding: React.PropTypes.bool.isRequired,
    hideSource: React.PropTypes.bool.isRequired,
    isEmbedView: React.PropTypes.bool.isRequired,
  },

  render: function () {
    var appWidth = applabConstants.APP_WIDTH;
    var appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;

    var classes = '';
    if (this.props.visualizationHasPadding) {
      classes += 'with_padding';
    }

    var vizStyle = [
      (this.props.isEmbedView || this.props.hideSource) && styles.nonResponsive,
      this.props.isShareView && styles.share
    ];

    return (
      <ProtectedStatefulDiv>
        <div id="visualization" className={classes} style={vizStyle}>
          <div id="divApplab" className="appModern" tabIndex="1"/>
          <div id="designModeViz" className="appModern" style={commonStyles.hidden}/>
          <svg version="1.1"
               baseProfile="full"
               xmlns="http://www.w3.org/2000/svg"
               id="visualizationOverlay"
               width={appWidth}
               height={appHeight}
               viewBox={"0 0 " + appWidth + " " + appHeight}
               pointerEvents="none"/>
        </div>
      </ProtectedStatefulDiv>
    );
  }
});

module.exports = connect(function propsFromStore(state) {
  return {
    visualizationHasPadding: state.level.visualizationHasPadding,
    hideSource: state.level.hideSource,
    isEmbedView: state.level.isEmbedView,
    isShareView: state.level.isShareView
  };
})(Radium(Visualization));
