var applabConstants = require('./constants');

var styles = {
  hidden: {
    display: 'none'
  }
};

var Visualization = React.createClass({
  render: function () {
    var appWidth = applabConstants.APP_WIDTH;
    var appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;
    return (
      <div>
        <div id="visualization">
          <div id="divApplab" className="appModern" tabIndex="1"/>
          <div id="designModeViz" className="appModern" style={styles.hidden}/>
          <svg version="1.1"
               baseProfile="full"
               xmlns="http://www.w3.org/2000/svg"
               id="visualizationOverlay"
               width={appWidth}
               height={appHeight}
               viewBox={"0 0 " + appWidth + " " + appHeight}
               pointerEvents="none"/>
        </div>
      </div>
    );
  }
});

module.exports = Visualization;
