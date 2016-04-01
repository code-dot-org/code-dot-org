var studioApp = require('../StudioApp').singleton;
var applabCommands = require('./commands');

var applabTurtle = module.exports;

// These offset are used to ensure that the turtle image is centered over
// its x,y coordinates. The image is currently 48x48, rendered at 24x24.
var TURTLE_WIDTH = 24;
var TURTLE_HEIGHT = 24;
var TURTLE_ROTATION_OFFSET = -45;

applabTurtle.getTurtleContext = function () {
  var canvas = document.getElementById('turtleCanvas');

  if (!canvas) {
    // If there is not yet a turtleCanvas, create it:
    applabCommands.createCanvas({'elementId': 'turtleCanvas', 'turtleCanvas': true});
    canvas = document.getElementById('turtleCanvas');

    // And create the turtle (defaults to visible):
    Applab.turtle.visible = true;
    var divApplab = document.getElementById('divApplab');
    var turtleImage = document.createElement("img");
    turtleImage.src = studioApp.assetUrl('media/applab/723-location-arrow-toolbar-48px-centered.png');
    turtleImage.id = 'turtleImage';
    applabTurtle.updateTurtleImage(turtleImage);
    turtleImage.ondragstart = function () { return false; };
    Applab.activeScreen().appendChild(turtleImage);
  }

  return canvas.getContext("2d");
};

applabTurtle.updateTurtleImage = function (turtleImage) {
  if (!turtleImage) {
    turtleImage = document.getElementById('turtleImage');
  }
  turtleImage.style.left = (Applab.turtle.x - TURTLE_WIDTH / 2) + 'px';
  turtleImage.style.top = (Applab.turtle.y - TURTLE_HEIGHT / 2) + 'px';
  var heading = Applab.turtle.heading + TURTLE_ROTATION_OFFSET;
  var transform = 'rotate(' + heading + 'deg)';
  turtleImage.style.transform = transform;
  turtleImage.style.msTransform = transform;
  turtleImage.style.webkitTransform = transform;
};

applabTurtle.turtleSetVisibility = function (visible) {
  // call this first to ensure there is a turtle (in case this is the first API)
  applabTurtle.getTurtleContext();
  var turtleImage = document.getElementById('turtleImage');
  turtleImage.style.visibility = visible ? 'visible' : 'hidden';
};
