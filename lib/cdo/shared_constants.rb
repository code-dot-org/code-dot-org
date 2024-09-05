require 'json'
require_relative 'http_cache'

# This is the source of truth for a set of constants that are shared between JS
# and ruby code. generateSharedConstants.rb is the file that processes this and
# outputs JS. It is run via `grunt exec:generateSharedConstants` from the apps
# directory.
#
# Many of these constants exist in other files. Changes to this file often should
# result in changes to these other files.

module SharedConstants
  DEFAULT_LOCALE = 'en-US'.freeze

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
      lti_v1: 'lti_v1',
    }
  )

  STUDENT_GRADE_LEVELS = %w(K 1 2 3 4 5 6 7 8 9 10 11 12 Other).freeze

  PL_GRADE_VALUE = 'pl'.freeze

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
    poetry
    poetry_hoc
    thebadguys
    music
  ).freeze

  # For privacy reasons, App Lab and Game Lab can only be shared if certain conditions are met. These project types can be shared if: the user is >= 13 years old and their teacher has NOT disabled sharing OR the user is < 13 and their teacher has enabled sharing.
  CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES = %w(
    applab
    gamelab
  ).freeze

  # For privacy reasons, sprite lab projects can only be published if they are not in "restricted share mode".
  # This mode is triggered if the user is a student and has uploaded an image to their project.
  RESTRICTED_PUBLISH_PROJECT_TYPES = %w(spritelab).freeze

  UNPUBLISHABLE_PROJECT_TYPES = %w(
    algebra_game
    calc
    eval
    minecraft_codebuilder
    weblab
  )

  ALL_PUBLISHABLE_PROJECT_TYPES =
    ALWAYS_PUBLISHABLE_PROJECT_TYPES + CONDITIONALLY_PUBLISHABLE_PROJECT_TYPES + RESTRICTED_PUBLISH_PROJECT_TYPES

  ALL_PROJECT_TYPES = ALL_PUBLISHABLE_PROJECT_TYPES + UNPUBLISHABLE_PROJECT_TYPES

  # The status of a featured project based on it's `featured_at` and `unfeatured_at` properties
  FEATURED_PROJECT_STATUS = OpenStruct.new(
    {
      active: 'active',
      bookmarked: 'bookmarked',
      archived: 'archived',
    }
  )

  FEATURED_PROJECT_CONSTANTS = OpenStruct.new(
    {MAX_REQUESTS_PER_CATEGORY: 15}
  )

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
      "console.clear": null,
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
      "__.on": null,
      "__.off": null,
      "__.toggle": null,
      "__.blink": null,
      "__.pulse": null,
      "colorLeds[0].on": null,
      "colorLeds[0].off": null,
      "colorLeds[0].toggle": null,
      "colorLeds[0].blink": null,
      "colorLeds[0].pulse": null,
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
      "soundSensor.setScale": null,
      "soundSensor.threshold": null,
      "lightSensor.value": null,
      "lightSensor.setScale": null,
      "lightSensor.threshold": null,
      "tempSensor.F": null,
      "tempSensor.C": null,
      "toggleSwitch.isOpen": null,
      "onBoardEvent": null,

      // micro:bit
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
      "console.clear": null,
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

  RUBRIC_UNDERSTANDING_LEVELS = OpenStruct.new(
    {
      EXTENSIVE: 3,
      CONVINCING: 2,
      LIMITED: 1,
      NONE: 0,
    }
  ).freeze

  # These reflect the 'status' of an AI rubric evaluation
  RUBRIC_AI_EVALUATION_STATUS = {
    # Queued as a job
    QUEUED: 0,
    # Job is running
    RUNNING: 1,
    # Succeeded
    SUCCESS: 2,
    # General failure (along with anything larger)
    FAILURE: 1000,
    # PII Failure
    PII_VIOLATION: 1001,
    # Profanity Failure
    PROFANITY_VIOLATION: 1002,
    # Request Too Large
    REQUEST_TOO_LARGE: 1003,
    # Student exceeded max number of evaluations per project
    STUDENT_LIMIT_EXCEEDED: 1004,
    # Teacher exceeded max number of evaluations per student per project
    TEACHER_LIMIT_EXCEEDED: 1005,
  }.freeze

  RUBRIC_AI_EVALUATION_LIMITS = {
    # Maximum number of evaluations we will automatically run for a student per project
    STUDENT_LIMIT: 10,

    # Maximum number of evaluations a teacher can request for a rubric per student
    TEACHER_LIMIT: 10
  }

  EMAIL_LINKS = OpenStruct.new(
    {
      PRIVACY_POLICY_URL: "https://code.org/privacy",
      CONTACT_US_URL: "https://code.org/contact",
      TOS_URL: "https://code.org/tos",
      STUDENT_PRIVACY_PLEDGE_URL: "https://studentprivacypledge.org/signatories/",
      COMMON_SENSE_MEDIA_URL: "https://privacy.commonsense.org/evaluation/code.org",
      CDO_SUPPORT_MAILTO: "mailto:support@code.org",
    }
  ).freeze

  CHILD_ACCOUNT_COMPLIANCE_STATES = OpenStruct.new(
    {
      GRACE_PERIOD: 'p',
      LOCKED_OUT: 'l',
      PERMISSION_GRANTED: 'g'
    }
  ).freeze

  VOICES = {
    en_us: {
      VOICE: 'sharon22k',
      SPEED: 180,
      SHAPE: 100,
    },
    es_es: {
      VOICE: 'ines22k',
      SPEED: 180,
      SHAPE: 100,
    },
    es_mx: {
      VOICE: 'rosa22k',
      SPEED: 180,
      SHAPE: 100,
    },
    it_it: {
      VOICE: 'vittorio22k',
      SPEED: 180,
      SHAPE: 100,
    },
    pt_br: {
      VOICE: 'marcia22k',
      SPEED: 180,
      SHAPE: 100,
    },
  }.freeze
  CENSUS_CONSTANTS = OpenStruct.new(
    {CURRENT_CENSUS_SCHOOL_YEAR: 2023}
  )

  LMS_LINKS = OpenStruct.new(
    {
      INTEGRATION_GUIDE_URL: 'https://support.code.org/hc/en-us/articles/23120014459405-Learning-Management-System-LMS-and-Single-Sign-On-SSO-Integrations-and-Support-for-Code-org',
      INSTALL_INSTRUCTIONS_URL: 'https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System',
      INSTALL_GUIDE_FOR_CANVAS_URL: 'https://support.code.org/hc/en-us/articles/23123273783437-Install-the-Code-org-Integration-for-Canvas',
      ROSTER_SYNC_INSTRUCTIONS_URL: 'https://support.code.org/hc/en-us/articles/23621978654605-Sync-Rosters-with-your-Learning-Management-System',
      ADDITIONAL_FEEDBACK_URL: 'https://studio.code.org/form/lms_integration_modal_feedback',
      # TODO(P20-873): Replace SUPPORTED_METHODS_URL with the link to the supported methods documentation
      SUPPORTED_METHODS_URL: 'https://github.com/code-dot-org/code-dot-org/blob/staging/docs/lti-integration.md#option-2-manual-entry',
    }
  ).freeze

  # Current song manifest file name for Dance Party. Note that different manifests
  # can be tested using query params (?manifest=...), but once this value is updated
  # the default manifest will change for all users.
  DANCE_SONG_MANIFEST_FILENAME = 'songManifest2024_v2.json'

  # We should always specify a version for the LLM so the results don't unexpectedly change.
  # reference: https://platform.openai.com/docs/models/gpt-3-5
  AI_TUTOR_CHAT_MODEL_VERISON = 'gpt-4o-2024-05-13'

  # These reflect the 'status' of an AI Interaction,
  # and are used in both AI Tutor and AI Chat.
  AI_INTERACTION_STATUS = {
    ERROR: 'error',
    PII_VIOLATION: 'pii_violation',
    PROFANITY_VIOLATION: 'profanity_violation',
    OK: 'ok',
    UNKNOWN: 'unknown',
  }.freeze

  AI_TUTOR_INTERACTION_STATUS = AI_INTERACTION_STATUS

  AI_TUTOR_TYPES = {
    COMPILATION: 'compilation',
    VALIDATION: 'validation',
    GENERAL_CHAT: 'general_chat',
  }.freeze

  USER_TYPES = OpenStruct.new(
    STUDENT: 'student',
    TEACHER: 'teacher',
  ).freeze

  AI_REQUEST_EXECUTION_STATUS = {
    # The request has been created but has not yet been processed.
    NOT_STARTED: 0,
    # The request has been queued for processing.
    QUEUED: 1,
    # The request is currently being processed.
    RUNNING: 2,
    # The request was successfully processed.
    SUCCESS: 3,
    # The request failed to process for an unexpected reason.
    FAILURE: 1000,
    # Profanity detected in the user's input.
    USER_PROFANITY: 1001,
    # PII detected in the user's input.
    USER_PII: 1002,
    # Profanity detected in the model's output.
    MODEL_PROFANITY: 1003,
    # PII detected in the model's output.
    MODEL_PII: 1004
  }

  AI_CHAT_MODEL_IDS = {
    ARITHMO: "gen-ai-arithmo2-mistral-7b",
    BIOMISTRAL: "gen-ai-biomistral-7b",
    MISTRAL: "gen-ai-mistral-7b-inst-v01",
    KAREN: "gen-ai-karen-creative-mistral-7b",
    PIRATE: "gen-ai-mistral-pirate-7b"
  }
end
