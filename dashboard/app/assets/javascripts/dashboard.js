// Dashboard namespace
window.dashboard = {};

window.components = {};

var TEMP_UPDATE = function() {
  // TODO: Investigate why this is sometimes called before the component has mounted.
  if (this._lifeCycleState == "UNMOUNTED")
    return;

  this.setState({
    updated: Math.random()
  });
};
