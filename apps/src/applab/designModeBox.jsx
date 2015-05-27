var React = require('react')
var applabMsg = require('./locale')

module.exports = React.createClass({
  propTypes: {
    handleDragStart: React.PropTypes.func
  },
  render: function() {
    return (
      <div id="designModeBoxContainer" width="100%">
        <table width="100%">
          <colgroup>
            <col width="270px"/>
            <col/>
          </colgroup>
          <tr>
            <td>
              <h3>{applabMsg.designToolboxDescription}</h3>
              <div id="design-elements">
                {/* TODO (brent) better approach than storing this as a data on the element? */}
                <div data-element-type="BUTTON" className="new-design-element">button</div>
                <div data-element-type="LABEL" className="new-design-element">label</div>
                <div data-element-type="TEXT_INPUT" className="new-design-element">input</div>
                <div data-element-type="TEXT_AREA" className="new-design-element">text area</div>
                <div data-element-type="CHECKBOX" className="new-design-element">checkbox</div>
                <div data-element-type="RADIO_BUTTON" className="new-design-element">radio button</div>
                <div data-element-type="DROPDOWN" className="new-design-element">dropdown</div>
                <div data-element-type="IMAGE" className="new-design-element">image</div>
                <div data-element-type="CANVAS" className="new-design-element">canvas</div>
                <button id="designModeClear" className="share">Clear</button><br/>
              </div>
            </td>
            <td>
              <div id="design-properties">
              </div>
            </td>
          </tr>
        </table>
      </div>
    )
  },
  componentDidMount: function () {
    this.makeDraggable();
  },
  componentDidUpdate: function () {
    this.makeDraggable();
  },
  makeDraggable: function() {
    // TODO(dave): apply only to elements inside this component
    $('.new-design-element').draggable({
      containment:"#codeApp",
      helper:"clone",
      appendTo:"#codeApp",
      revert: 'invalid',
      zIndex: 2,
      start: this.props.handleDragStart()
    });
  }
});