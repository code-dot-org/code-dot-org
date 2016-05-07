var applabConstants = require('./constants');
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');
import VisualizationOverlay from '../templates/VizOverlay';
import AppLabCrosshairOverlay from './AppLabCHOverlay';
import AppLabTooltipOverlay from './AppLabTooltipOverlay';

var Visualization = React.createClass({
  render: function () {
    var appWidth = applabConstants.APP_WIDTH;
    var appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;
    return (
      <ProtectedStatefulDiv>
        <div id="visualization">
          <div id="divApplab" className="appModern" tabIndex="1"/>
          <div id="designModeViz" className="appModern" style={commonStyles.hidden}/>
          <VisualizationOverlay width={appWidth} height={appHeight}>
            <AppLabCrosshairOverlay/>
            <AppLabTooltipOverlay/>
          </VisualizationOverlay>
        </div>
      </ProtectedStatefulDiv>
    );
  }
});

module.exports = Visualization;
