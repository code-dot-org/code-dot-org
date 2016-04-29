var Radium = require('radium');

var commonStyles = require('../commonStyles');
var experiments = require('../experiments');

/**
 * A purple pane header that can be active (purple), inactive (light purple)
 * or read only (charcoal).
 */

 var PaneHeader = React.createClass({
   propTypes: {
     hasFocus: React.PropTypes.bool.isRequired,
     readOnly: React.PropTypes.bool
   },

   render: function () {
     // Initially, don't want to toggle PaneHeader unless runModeIndicators is on
     var runModeIndicators = experiments.isEnabled('runModeIndicators');

     // TODO purpleHeader style should possible move into this module
     var style = [
       commonStyles.purpleHeader,
       runModeIndicators && !this.props.hasFocus && commonStyles.purpleHeaderUnfocused,
       this.props.readOnly && commonStyles.purpleHeaderReadOnly,
     ];

     return (
       <div {...this.props} style={style}/>
     );
   }
 });

 module.exports = Radium(PaneHeader);
