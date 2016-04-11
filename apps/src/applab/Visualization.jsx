var Visualization = React.createClass({
  propTypes: {
    appWidth: React.PropTypes.number.isRequired,
    appHeight: React.PropTypes.number.isRequired,
  },

  render: function () {
    return (
      <div>
        <div id="divApplab" class="appModern" tabindex="1">
        </div>
        <div id="designModeViz" class="appModern" style="display:none;">
        </div>
        <svg version="1.1"
             baseProfile="full"
             xmlns="http://www.w3.org/2000/svg"
             id="visualizationOverlay"
             width="<%= appWidth -%>"
             height="<%= appHeight -%>"
             viewBox="0 0 <%= appWidth -%> <%= appHeight -%>"
             pointer-events="none"></svg>
      </div>
    );
  }
});

module.exports = Visualization;
