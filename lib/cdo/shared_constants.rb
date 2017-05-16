require 'json'

# This is the source of truth for a set of constants that are shared between JS
# and ruby code. generateSharedConstants.rb is the file that processes this and
# outputs JS. It is run via `rake build:shared_constants

module SharedConstants
  # Used to communicate different types of levels
  LEVEL_KIND = OpenStruct.new(
    {
      peer_review: "peer_review",
      assessment: "assessment",
      puzzle: "puzzle",
      unplugged: "unplugged",
      level: "level"
    }
  ).freeze

  # Different possibilities for level.status, used to communicate how user has
  # performed on a given level
  LEVEL_STATUS = OpenStruct.new(
    {
      not_tried: "not_tried",
      submitted: "submitted",
      locked: "locked",
      perfect: "perfect",
      passed: "passed",
      attempted: "attempted",
      review_accepted: "review_accepted",
      review_rejected: "review_rejected",
      dots_disabled: "dots_disabled"
    }
  ).freeze

  # This is a set of Applab blocks. It is used by dashboard to initialize the
  # default palette when creating a level. It is used by apps to determine
  # what the full set of blocks available is.
  APPLAB_BLOCKS = <<-JSON
    {
      // UI Controls
      "onEvent": null,
      "button": null,
      "textInput": null,
      "textLabel": null,
      "dropdown": null,
      "getText": null,
      "setText": null,
      "getNumber": null,
      "setNumber": null,
      "checkbox": null,
      "radioButton": null,
      "getChecked": null,
      "setChecked": null,
      "image": null,
      "getImageURL": null,
      "setImageURL": null,
      "playSound": null,
      "stopSound": null,
      "showElement": null,
      "hideElement": null,
      "deleteElement": null,
      "setPosition": null,
      "setSize": null,
      "setProperty": null,
      "getProperty": null,
      "write": null,
      "getXPosition": null,
      "getYPosition": null,
      "setScreen": null,
      "rgb": null,

      // Canvas
      "createCanvas": null,
      "setActiveCanvas": null,
      "line": null,
      "circle": null,
      "rect": null,
      "setStrokeWidth": null,
      "setStrokeColor": null,
      "setFillColor": null,
      "drawImageURL": null,
      "getImageData": null,
      "putImageData": null,
      "clearCanvas": null,
      "getRed": null,
      "getGreen": null,
      "getBlue": null,
      "getAlpha": null,
      "setRed": null,
      "setGreen": null,
      "setBlue": null,
      "setAlpha": null,
      "setRGB": null,

      // Data
      "startWebRequest": null,
      "setKeyValue": null,
      "getKeyValue": null,
      "createRecord": null,
      "readRecords": null,
      "updateRecord": null,
      "deleteRecord": null,
      "onRecordEvent": null,
      "getUserId": null,
      "drawChart": null,
      "drawChartFromRecords": null,

      // Turtle
      "moveForward": null,
      "moveBackward": null,
      "move": null,
      "moveTo": null,
      "dot": null,
      "turnRight": null,
      "turnLeft": null,
      "turnTo": null,
      "arcRight": null,
      "arcLeft": null,
      "getX": null,
      "getY": null,
      "getDirection": null,
      "penUp": null,
      "penDown": null,
      "penWidth": null,
      "penColor": null,
      "penRGB": null,
      "show": null,
      "hide": null,
      "speed": null,

      // Control
      "forLoop_i_0_4": null,
      "ifBlock": null,
      "ifElseBlock": null,
      "whileBlock": null,
      "setTimeout": null,
      "clearTimeout": null,
      "timedLoop": null,
      "stopTimedLoop": null,
      "getTime": null,

      // Math
      "addOperator": null,
      "subtractOperator": null,
      "multiplyOperator": null,
      "divideOperator": null,
      "equalityOperator": null,
      "inequalityOperator": null,
      "greaterThanOperator": null,
      "greaterThanOrEqualOperator": null,
      "lessThanOperator": null,
      "lessThanOrEqualOperator": null,
      "andOperator": null,
      "orOperator": null,
      "notOperator": null,
      "randomNumber_min_max": null,
      "mathRound": null,
      "mathAbs": null,
      "mathMax": null,
      "mathMin": null,
      "mathRandom": null,

      // Variables
      "declareAssign_x": null,
      "declareNoAssign_x": null,
      "assign_x": null,
      "declareAssign_x_prompt": null,
      "declareAssign_x_promptNum": null,
      "console.log": null,
      "declareAssign_str_hello_world": null,
      "substring": null,
      "indexOf": null,
      "includes": null,
      "length": null,
      "toUpperCase": null,
      "toLowerCase": null,
      "declareAssign_list_abd": null,
      "listLength": null,
      "insertItem": null,
      "appendItem": null,
      "removeItem": null,

      // Functions
      "functionParams_none": null,
      "functionParams_n": null,
      "callMyFunction": null,
      "callMyFunction_n": null,
      "return": null,
      "comment": null,

      // Maker
      "pinMode": null,
      "digitalWrite": null,
      "digitalRead": null,
      "analogWrite": null,
      "analogRead": null,
      "boardConnected": null,

      // Circuit Playground
      "on": null,
      "off": null,
      "toggle": null,
      "blink": null,
      "stop": null,
      "color": null,
      "intensity": null,
      "led.on": null,
      "led.off": null,
      "led.blink": null,
      "led.toggle": null,
      "led.pulse": null,
      "buzzer.frequency": null,
      "buzzer.note": null,
      "buzzer.stop": null,
      "buzzer.play": null,
      "accelerometer.getOrientation": null,
      "accelerometer.start": null,
      "accelerometer.getAcceleration": null,
      "isPressed": null,
      "holdtime": null,
      "soundSensor.value": null,
      "soundSensor.getAveragedValue": null,
      "soundSensor.setScale": null,
      "lightSensor.value": null,
      "lightSensor.getAveragedValue": null,
      "lightSensor.setScale": null,
      "tempSensor.F": null,
      "tempSensor.C": null,
      "toggleSwitch.isOpen": null,
      "onBoardEvent": null
    }
  JSON

  # This is a set of Gamelab blocks. It is used by dashboard to initialize the
  # default palette when creating a level. It is used by apps to determine
  # what the full set of blocks available is.
  GAMELAB_BLOCKS = <<-JSON
    {
      // Game Lab
      "draw": null,
      "drawSprites": null,
      "World.allSprites": null,
      "World.width": null,
      "World.height": null,
      "World.mouseX": null,
      "World.mouseY": null,
      "World.frameRate": null,
      "World.frameCount": null,
      "World.seconds": null,
      "playSound": null,
      "stopSound": null,
      "keyDown": null,
      "keyWentDown": null,
      "keyWentUp": null,
      "mouseDidMove": null,
      "mouseDown": null,
      "mouseIsOver": null,
      "mouseWentDown": null,
      "mouseWentUp": null,
      "mousePressedOver": null,
      "camera.on": null,
      "camera.off": null,
      "camera.isActive": null,
      "camera.mouseX": null,
      "camera.mouseY": null,
      "camera.x": null,
      "camera.y": null,
      "camera.zoom": null,
      "comment_GameLab": null,

      // Sprites
      "var sprite = createSprite": null,
      "createEdgeSprites": null,
      "setSpeedAndDirection": null,
      "getDirection": null,
      "getSpeed": null,
      "isTouching": null,
      "destroy": null,
      "pointTo": null,
      "bounce": null,
      "bounceOff": null,
      "collide": null,
      "displace": null,
      "overlap": null,
      "setAnimation": null,
      "setCollider": null,
      "setVelocity": null,
      "sprite.height": null,
      "sprite.width": null,
      "getScaledWidth": null,
      "getScaledHeight": null,
      "debug": null,
      "depth": null,
      "lifetime": null,
      "mirrorX": null,
      "mirrorY": null,
      "nextFrame": null,
      "pause": null,
      "play": null,
      "setFrame": null,
      "x": null,
      "y": null,
      "bounciness": null,
      "rotateToDirection": null,
      "rotation": null,
      "rotationSpeed": null,
      "scale": null,
      "shapeColor": null,
      "velocityX": null,
      "velocityY": null,
      "visible": null,
      "comment_Sprites": null,

      // Groups
      "var group = createGroup": null,
      "add": null,
      "remove": null,
      "clear": null,
      "contains": null,
      "get": null,
      "group.isTouching": null,
      "group.bounce": null,
      "group.bounceOff": null,
      "group.collide": null,
      "group.displace": null,
      "group.overlap": null,
      "maxDepth": null,
      "minDepth": null,
      "destroyEach": null,
      "pointToEach": null,
      "setAnimationEach": null,
      "setColorEach": null,
      "setColliderEach": null,
      "setDepthEach": null,
      "setHeightEach": null,
      "setLifetimeEach": null,
      "setMirrorXEach": null,
      "setMirrorYEach": null,
      "setRotateToDirectionEach": null,
      "setRotationEach": null,
      "setRotationSpeedEach": null,
      "setScaleEach": null,
      "setSpeedAndDirectionEach": null,
      "setVelocityEach": null,
      "setVelocityXEach": null,
      "setVelocityYEach": null,
      "setVisibleEach": null,
      "setWidthEach": null,
      "comment_Groups": null,

      // Drawing
      "background": null,
      "fill": null,
      "noFill": null,
      "stroke": null,
      "strokeWeight": null,
      "noStroke": null,
      "rgb": null,
      "arc": null,
      "ellipse": null,
      "line": null,
      "point": null,
      "rect": null,
      "regularPolygon": null,
      "shape": null,
      "text": null,
      "textAlign": null,
      "textFont": null,
      "textSize": null,
      "comment_Drawing": null,

      // Control
      "forLoop_i_0_4": null,
      "ifBlock": null,
      "ifElseBlock": null,
      "whileBlock": null,
      "comment_Control": null,

      // Math
      "addOperator": null,
      "subtractOperator": null,
      "multiplyOperator": null,
      "divideOperator": null,
      "equalityOperator": null,
      "inequalityOperator": null,
      "greaterThanOperator": null,
      "greaterThanOrEqualOperator": null,
      "lessThanOperator": null,
      "lessThanOrEqualOperator": null,
      "andOperator": null,
      "orOperator": null,
      "notOperator": null,
      "randomNumber_min_max": null,
      "mathRound": null,
      "mathAbs": null,
      "mathMax": null,
      "mathMin": null,
      "mathRandom": null,
      "comment_Math": null,

      // Variables
      "declareAssign_x": null,
      "declareNoAssign_x": null,
      "assign_x": null,
      "console.log": null,
      "declareAssign_str_hello_world": null,
      "substring": null,
      "indexOf": null,
      "includes": null,
      "length": null,
      "toUpperCase": null,
      "toLowerCase": null,
      "declareAssign_list_abd": null,
      "listLength": null,
      "comment_Variables": null,

      // Functions
      "functionParams_none": null,
      "functionParams_n": null,
      "callMyFunction": null,
      "callMyFunction_n": null,
      "return": null,
      "comment": null
    }
  JSON
end
