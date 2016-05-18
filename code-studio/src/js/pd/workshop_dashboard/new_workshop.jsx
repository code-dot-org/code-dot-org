/* global React WORKSHOP_CONSTANTS google */

var WorkshopForm = require('./components/workshop_form.jsx');

var NewWorkshop = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  handleSaved: function (workshop) {
    this.context.router.push(`/workshops/${workshop.id}`);
  },

  render: function () {
    return (
      <div>
        <h2>New Workshop</h2>
        <WorkshopForm onSaved={this.handleSaved} />
      </div>
    );
  }
});
module.exports = NewWorkshop;
