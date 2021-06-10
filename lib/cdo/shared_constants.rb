require 'json'
require_relative '../../cookbooks/cdo-varnish/libraries/http_cache'

# This is the source of truth for a set of constants that are shared between JS
# and ruby code. generateSharedConstants.rb is the file that processes this and
# outputs JS. It is run via `grunt exec:generateSharedConstants` from the apps
# directory.
#
# Many of these constants exist in other files. Changes to this file often should
# result in changes to these other files.

module SharedConstants
  # Used to determine who can access curriculum content
  PUBLISHED_STATE = OpenStruct.new(
    {
      pilot: "pilot",
      beta: "beta",
      preview: "preview",
      stable: "stable"
    }
  ).freeze

  # Used to communicate different types of levels
  LEVEL_KIND = OpenStruct.new(
    {
      peer_review: "peer_review",
      assessment: "assessment",
      puzzle: "puzzle",
      unplugged: "unplugged",
      level: "level",
      stage_extras: "stage_extras",
    }
  ).freeze

  # Different possibilities for level.status, used to communicate how user has
  # performed on a given level
  LEVEL_STATUS = OpenStruct.new(
    {
      not_tried: "not_tried",
      submitted: "submitted",
      perfect: "perfect",
      passed: "passed",
      attempted: "attempted",
      review_accepted: "review_accepted",
      review_rejected: "review_rejected",
      dots_disabled: "dots_disabled",
      free_play_complete: "free_play_complete",
      completed_assessment: 'completed_assessment'
    }
  ).freeze

  # The set of valid login types for a section
  SECTION_LOGIN_TYPE = OpenStruct.new(
    {
      word: 'word',
      picture: 'picture',
      email: 'email',
      google_classroom: 'google_classroom',
      clever: 'clever',
    }
  )

  # The set of artist autorun options
  ARTIST_AUTORUN_OPTIONS = OpenStruct.new(
    {
      full_auto_run: 'FULL_AUTO_RUN',
    }
  ).freeze

  # Valid milestone post modes
  POST_MILESTONE_MODE = OpenStruct.new(
    {
      all: 'all',
      successful_runs_and_final_level_only: 'successful_runs_and_final_level_only',
      final_level_only: 'final_level_only',
    }
  )

  # Projects with an abuse score over this threshold will be blocked.
  ABUSE_CONSTANTS = OpenStruct.new(
    {ABUSE_THRESHOLD: 15}
  )

  # This list of project types can be shared by anyone regardless of their age or sharing setting.
  ALWAYS_PUBLISHABLE_PROJECT_TYPES = %w(
    artist
    frozen
    playlab
    gumball
    iceage
    infinity
    minecraft_adventurer
    minecraft_designer
    minecraft_hero
    minecraft_aquatic
    starwars
    starwarsblocks
    starwarsblocks_hour
    flappy
    bounce
    sports
    basketball
    artist_k1
    playlab_k1
    dance
    spritelab
  ).freeze

  # For privacy reasons, App Lab and Game Lab can only be shared if certain conditions are met. These project types can be shared if: the user is >= 13 years old and their teacher has NOT disabled sharing OR the user is < 13 and their teacher has enabled sharing.
  CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES = %w(
    applab
    gamelab
  ).freeze

  UNPUBLISHABLE_PROJECT_TYPES = %w(
    algebra_game
    calc
    eval
    minecraft_codebuilder
    spritelab
    weblab
  )

  ALL_PUBLISHABLE_PROJECT_TYPES =
    ALWAYS_PUBLISHABLE_PROJECT_TYPES + CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES

  ALL_PROJECT_TYPES = ALL_PUBLISHABLE_PROJECT_TYPES + UNPUBLISHABLE_PROJECT_TYPES

  # This is a set of Applab blocks. It is used by dashboard to initialize the
  # default palette when creating a level. It is used by apps to determine
  # what the full set of blocks available is.
  APPLAB_BLOCKS = <<-JSON.freeze
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
      "playSpeech": null,
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
      "open": null,

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
      "getColumn": null,
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
      "getPrediction": null,

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
      "moduloOperator": null,
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
      "mathPow": null,
      "mathSqrt": null,

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
      "declareAssign_list_123": null,
      "accessListItem": null,
      "listLength": null,
      "insertItem": null,
      "appendItem": null,
      "removeItem": null,
      "join": null,
      "declareAssign_object": null,
      "getValue": null,
      "addPair": null,

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
      "var myLed = createLed": null,
      "var myButton = createButton": null,
      "var mySensor = createCapacitiveTouchSensor": null,

      // Circuit Playground
      "on": null,
      "off": null,
      "toggle": null,
      "blink": null,
      "pulse": null,
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
      "buzzer.playNotes": null,
      "buzzer.playSong": null,
      "accelerometer.getOrientation": null,
      "accelerometer.getAcceleration": null,
      "isPressed": null,
      "holdtime": null,
      "soundSensor.value": null,
      "soundSensor.getAveragedValue": null,
      "soundSensor.setScale": null,
      "soundSensor.threshold": null,
      "lightSensor.value": null,
      "lightSensor.getAveragedValue": null,
      "lightSensor.setScale": null,
      "lightSensor.threshold": null,
      "tempSensor.F": null,
      "tempSensor.C": null,
      "toggleSwitch.isOpen": null,
      "onBoardEvent": null,

      // micro:bit
      "on": null,
      "off": null,
      "toggle": null,
      "ledScreen.on": null,
      "ledScreen.off": null,
      "ledScreen.toggle": null,
      "ledScreen.display": null,
      "ledScreen.clear": null,
      "ledScreen.scrollNumber": null,
      "ledScreen.scrollString": null,
      "onBoardEvent": null,
      "isPressed": null,
      "lightSensor.value": null,
      "lightSensor.getAveragedValue": null,
      "lightSensor.setScale": null,
      "lightSensor.threshold": null,
      "compass.getHeading": null
    }
  JSON

  # Goal blocks will not appear in App Lab unless they are explicitly included
  # in the level config.
  APPLAB_GOAL_BLOCKS = <<-JSON.freeze
    {
      // Goals
      "comment_Goals_1": null,
      "comment_Goals_2": null,
      "comment_Goals_3": null,
      "comment_Goals_4": null,
      "comment_Goals_5": null,
      "comment_Goals_6": null,
      "comment_Goals_7": null,
      "comment_Goals_8": null,
      "comment_Goals_9": null,
      "comment_Goals_10": null,
      "comment_Goals_11": null,
      "comment_Goals_12": null,
      "comment_Goals_13": null,
      "comment_Goals_14": null,
      "comment_Goals_15": null,
      "comment_Goals_16": null,
      "comment_Goals_17": null,
      "comment_Goals_18": null,
      "comment_Goals_19": null,
      "comment_Goals_20": null
    }
  JSON

  # This is a set of Gamelab blocks. It is used by dashboard to initialize the
  # default palette when creating a level. It is used by apps to determine
  # what the full set of blocks available is.
  GAMELAB_BLOCKS = <<-JSON.freeze
    {
      // Game Lab
      "draw": null,
      "drawSprites": null,
      "playSound": null,
      "stopSound": null,
      "playSpeech": null,
      "keyDown": null,
      "keyWentDown": null,
      "keyWentUp": null,
      "mouseDidMove": null,
      "mouseDown": null,
      "mouseIsOver": null,
      "mouseWentDown": null,
      "mouseWentUp": null,
      "mousePressedOver": null,
      "showMobileControls": null,
      "World.mouseX": null,
      "World.mouseY": null,
      "World.frameRate": null,
      "World.frameCount": null,
      "World.seconds": null,
      "World.width": null,
      "World.height": null,
      "World.allSprites": null,
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
      "setAnimation": null,
      "x": null,
      "y": null,
      "velocityX": null,
      "velocityY": null,
      "scale": null,
      "sprite.height": null,
      "sprite.width": null,
      "visible": null,
      "rotation": null,
      "rotationSpeed": null,
      "rotateToDirection": null,
      "debug": null,
      "isTouching": null,
      "collide": null,
      "displace": null,
      "overlap": null,
      "bounce": null,
      "bounceOff": null,
      "bounciness": null,
      "setCollider": null,
      "createEdgeSprites": null,
      "shapeColor": null,
      "tint": null,
      "alpha": null,
      "setVelocity": null,
      "getDirection": null,
      "getSpeed": null,
      "setSpeedAndDirection": null,
      "pointTo": null,
      "mirrorX": null,
      "mirrorY": null,
      "getScaledWidth": null,
      "getScaledHeight": null,
      "lifetime": null,
      "nextFrame": null,
      "pause": null,
      "play": null,
      "setFrame": null,
      "depth": null,
      "destroy": null,
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
      "setTintEach": null,
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
      "rect": null,
      "ellipse": null,
      "text": null,
      "textAlign": null,
      "textFont": null,
      "textSize": null,
      "arc": null,
      "line": null,
      "point": null,
      "regularPolygon": null,
      "shape": null,
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
      "moduloOperator": null,
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
      "mathPow": null,
      "mathSqrt": null,
      "comment_Math": null,

      // Variables
      "declareAssign_x": null,
      "declareNoAssign_x": null,
      "assign_x": null,
      "console.log": null,
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

  # Subset of Ruby Logger::Severity constants.
  # https://github.com/ruby/ruby/blob/trunk/lib/logger.rb
  # We don't use 2 irrelevant severity levels DEBUG (0) and INFO (1).
  ERROR_SEVERITY_LEVELS = {
    # A warning.
    WARN: 2,
    # A handleable error condition.
    ERROR: 3,
    # An unhandleable error that results in a program crash.
    FATAL: 4
  }.freeze
end
