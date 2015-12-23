window.dashboard = window.dashboard || {};

window.dashboard.ShareDialog = (function (React) {
  return React.createClass({
    render: function () {
      return (
        <div>
          <div className="modal-backdrop in"></div>
          <div tabindex="-1" className="modal dash_modal in" aria-hidden={false}>
            <div className="modal-body dash_modal_body">
              <div id="x-close" className="x-close" data-dismiss="modal">
              </div>
            </div>
            {this.props.body}
          </div>
        </div>
      );
    }
  });
})(React);
