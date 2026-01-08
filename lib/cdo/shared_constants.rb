require 'json'
require_relative 'http_cache'
require_relative '../state_abbr'

# This is the source of truth for a set of constants that are shared between JS
# and ruby code. generateSharedConstants.rb is the file that processes this and
# outputs JS. It is run via `grunt exec:generateSharedConstants` from the apps
# directory.
#
# Many of these constants exist in other files. Changes to this file often should
# result in changes to these other files.

module SharedConstants
  DEFAULT_LOCALE = 'en-US'.freeze

  # Used to communicate different types of levels.
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
  # performed on a given level.
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

  USER_LEVEL_INTERACTIONS = OpenStruct.new(
    {
      click_continue: "click_continue",
      click_finish: "click_finish",
      click_help_and_tips: "click_help_and_tips",
      click_keep_working: "click_keep_working",
      click_run: "click_run",
      click_submit: "click_submit",
      click_validate: "click_validate",
      code_execution_error: "code_execution_error",
    }
  ).freeze

  # The set of valid login types for a section.
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

  # The set of artist autorun options.
  ARTIST_AUTORUN_OPTIONS = OpenStruct.new(
    {
      full_auto_run: 'FULL_AUTO_RUN',
    }
  ).freeze

  # Valid milestone post modes.
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
    pythonlab
  ).freeze

  # For privacy reasons, App Lab and Game Lab can only be shared if certain conditions are met.
  # These project types can be shared if: the user is >= 13 years old and their teacher has NOT
  # disabled sharing OR the user is < 13 and their teacher has enabled sharing.
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

  # The status of a featured project based on it's `featured_at` and `unfeatured_at` properties.
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

  # These reflect the 'status' of an AI rubric evaluation.
  RUBRIC_AI_EVALUATION_STATUS = {
    # Queued as a job.
    QUEUED: 0,
    # Job is running.
    RUNNING: 1,
    # Succeeded.
    SUCCESS: 2,
    # General failure (along with anything larger).
    FAILURE: 1000,
    # PII Failure.
    PII_VIOLATION: 1001,
    # Profanity Failure.
    PROFANITY_VIOLATION: 1002,
    # Request Too Large.
    REQUEST_TOO_LARGE: 1003,
    # Student exceeded max number of evaluations per project.
    STUDENT_LIMIT_EXCEEDED: 1004,
    # Teacher exceeded max number of evaluations per student per project.
    TEACHER_LIMIT_EXCEEDED: 1005,
  }.freeze

  RUBRIC_AI_EVALUATION_LIMITS = {
    # Maximum number of evaluations we will automatically run for a student per project.
    STUDENT_LIMIT: 10,

    # Maximum number of evaluations a teacher can request for a rubric per student.
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

  CAP_LINKS = OpenStruct.new(
    PARENTAL_CONSENT_GUIDE_URL: 'https://support.code.org/hc/en-us/articles/15465423491085-How-do-I-obtain-parent-or-guardian-permission-for-student-accounts',
  )

  LMS_LINKS = OpenStruct.new(
    {
      INTEGRATION_GUIDE_URL: 'https://support.code.org/hc/en-us/articles/23120014459405-Learning-Management-System-LMS-and-Single-Sign-On-SSO-Integrations-and-Support-for-Code-org',
      INSTALL_INSTRUCTIONS_URL: 'https://support.code.org/hc/en-us/articles/23621907533965-Install-Code-org-Integrations-for-your-Learning-Management-System',
      ROSTER_SYNC_INSTRUCTIONS_URL: 'https://support.code.org/hc/en-us/articles/23621978654605-Sync-Rosters-with-your-Learning-Management-System',
      ADDITIONAL_FEEDBACK_URL: 'https://studio.code.org/form/lms_integration_modal_feedback',
      # TODO(P20-873): Replace SUPPORTED_METHODS_URL with the link to the supported methods documentation.
      SUPPORTED_METHODS_URL: 'https://github.com/code-dot-org/code-dot-org/blob/staging/docs/lti-integration.md#option-2-manual-entry',
    }
  ).freeze

  # Current song manifest file name for Dance Party. Note that different manifests
  # can be tested using query params (?manifest=...), but once this value is updated
  # the default manifest will change for all users.
  DANCE_SONG_MANIFEST_FILENAME = 'songManifest2025_v1.json'

  # We should always specify a version for the LLM so the results don't unexpectedly change.
  # reference: https://platform.openai.com/docs/models/gpt-3-5.
  AICHAT_MODEL_VERSION = 'gpt-4o-mini-2024-07-18'
  EVALUATE_STUDENT_LEARNING_MODEL_VERSION = 'gpt-4o-mini-2024-07-18'
  PERSONALIZATION_MODEL_VERSION = 'gpt-4o-mini-2024-07-18'

  AI_EVALUATION_TYPES = {
    SINGLE_STUDENT: 'single_student',
    SECTION_SUMMARY: 'section_summary',
  }.freeze

  # These reflect the 'status' of an AI Interaction,
  # and are used in both AI Tutor and AI Chat.
  AI_INTERACTION_STATUS = {
    ERROR: 'error',
    PII_VIOLATION: 'pii_violation',
    PROFANITY_VIOLATION: 'profanity_violation',
    USER_INPUT_TOO_LARGE: 'user_input_too_large',
    MODEL_TIMEOUT: 'model_timeout',
    OK: 'ok',
    UNKNOWN: 'unknown',
  }.freeze

  # TODO-AITUTOR: Remove these once ai_tutor_interaction model is removed.
  AI_TUTOR_INTERACTION_STATUS = AI_INTERACTION_STATUS

  AI_TUTOR_TYPES = {
    COMPILATION: 'compilation',
    VALIDATION: 'validation',
    GENERAL_CHAT: 'general_chat',
    COMPLETION: 'completion',
    GENERIC_HELP: 'generic_help',
  }.freeze

  USER_TYPES = OpenStruct.new(
    STUDENT: 'student',
    TEACHER: 'teacher',
  ).freeze

  NON_SCHOOL_OPTIONS = OpenStruct.new(
    SELECT_A_SCHOOL: 'selectASchool',
    CLICK_TO_ADD: 'clickToAdd',
    NO_SCHOOL_SETTING: 'noSchoolSetting'
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
    MODEL_PII: 1004,
    # The user input request exceeded the maximum token size allowed.
    USER_INPUT_TOO_LARGE: 1005,
    # The model took too long to respond.
    MODEL_TIMEOUT: 1006,
  }

  STUDENT_WORK_EVALUATION_STATUS = {
    # The student submitted a blank free response or did not change the starter code.
    NO_ATTEMPT: 'no_attempt',
    # Profanity detected in the student's work.
    STUDENT_PROFANITY: 'student_profanity',
    # PII detected in the student's work.
    STUDENT_PII: 'student_pii',
    # Possible responses from AI when evaluating student work.
    ALL_COMPLETE_CORRECT: 'all_complete_correct',
    PARTIAL_COMPLETE_CORRECT: 'partial_complete_correct',
    INCOMPLETE_INCORRECT: 'incomplete_incorrect',
    NOT_EVALUATED: 'not_evaluated',
  }

  AI_CHAT_MODEL_IDS = {
    ARITHMO: "gen-ai-arithmo2-mistral-7b",
    BIOMISTRAL: "gen-ai-biomistral-7b",
    MISTRAL: "gen-ai-mistral-7b-inst-v01",
    KAREN: "gen-ai-karen-creative-mistral-7b",
    PIRATE: "gen-ai-mistral-pirate-7b",
    CHATGPT: "gpt-4o-mini",
    LEARNLM: "learnlm-2.0-flash-experimental",
    GEMINI_2_0_FLASH: "gemini-2.0-flash",
    GEMINI_2_5_FLASH: "gemini-2.5-flash",
    GEMINI_2_5_FLASH_LITE: "gemini-2.5-flash-lite",
    GEMINI_2_5_PRO: "gemini-2.5-pro",
    GEMINI_3_PRO_PREVIEW: "gemini-3-pro-preview",
  }

  AI_CHAT_CLIENT_TYPES = {
    AI_CHAT_LAB: "ai-chat-lab",
    AI_TUTOR: "ai-tutor",
    FLOW_LAB: "flow-lab",
  }

  AI_CHAT_READ_TIMEOUTS = {
    AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB] => 30,
    AI_CHAT_CLIENT_TYPES[:AI_TUTOR] => 30,
    AI_CHAT_CLIENT_TYPES[:FLOW_LAB] => 60,
  }

  AICHAT_METRICS_NAMESPACE = 'GenAICurriculum'.freeze

  AI_CHAT_TEACHER_FEEDBACK = {
    # The teacher flagged a message that our system did not flag as inappropriate.
    CLEAN_DISAGREE: 'clean_disagree',
    # The teacher agreed with our system's flagging of a message as inappropriate.
    PROFANITY_AGREE: 'profanity_agree',
    # The teacher disagreed with our system's flagging of a message as inappropriate.
    PROFANITY_DISAGREE: 'profanity_disagree',
  }

  # Level of access to AI chat features for students in a section.
  AI_CHAT_ACCESS_LEVELS = {
    ENABLED: 'enabled',
    DISABLED: 'disabled',
    ESSENTIAL_ONLY: 'essential_only',
  }.freeze

  US_STATES = STATE_ABBR_WITH_DC_HASH.merge(DC: 'Washington, D.C.').sort_by(&:last).to_h.freeze

  PROJECT_SUBMISSION_STATUS = {
    CAN_SUBMIT: 'can_submit',
    ALREADY_SUBMITTED: 'already_submitted',
    PROJECT_TYPE_NOT_ALLOWED: 'project_type_not_allowed',
    RESTRICTED_SHARE_MODE: 'restricted_share_mode',
    SHARING_DISABLED: 'sharing_disabled',
    OWNER_TOO_NEW: 'owner_too_new',
    PROJECT_TOO_NEW: 'project_too_new',
  }

  EDUCATOR_ROLES = [
    {value: "classroom_teacher", label: "Classroom Teacher", category: 'educator'},
    {value: "stem_tech_teacher", label: "STEM/Technology Teacher", category: 'educator'},
    {value: "subject_area_teacher", label: "Subject Area Teacher", category: 'educator'},
    {value: "librarian_media_specialist", label: "Librarian/Media Specialist", category: 'educator'},
    {value: "homeschool_teacher", label: "Homeschool Teacher", category: 'educator'},
    {value: "school_admin", label: "School Administrator", category: "admin"},
    {value: "district_admin", label: "District Administrator", category: "admin"},
    {value: "parent", label: "Parent", category: 'other'},
    {value: "other", label: "Other", category: 'other'}
  ].freeze

  RESOURCE_EMBEDDABILITY_OPTIONS = {
    EMBED_AND_RESOURCE_DROPDOWN: {value: "embed_and_resource_dropdown", label: "AI TA knowledge base and resource dropdown"},
    EMBED_ONLY: {value: "embed_only", label: "AI TA knowledge base only"},
    RESOURCE_DROPDOWN_ONLY: {value: "resource_dropdown_only", label: "Resource dropdown only"}
  }.freeze

  AI_DIFF_CONTEXT = {
    LESSON: "lesson",
    UNIT: "unit",
    COURSE: "course",
    GENERAL: "general",
    LEVEL: "level",
    PROGRESS: "progress"
  }.freeze

  AI_DIFF_ASSOCIATION = {
    LESSON: "lesson",
    UNIT: "unit",
    COURSE: "course",
    SECTION: "section"
  }.freeze

  DISALLOWED_ROUTES = [
    "/admin/",
    "/api/",
    "/blockly/",
    "/dashboardapi/",
    "/join/",
    "/milestone/",
    "/projects/",
    "/sections/",
    "/r/",
    "/c/",
    "/oauth_sign_out/",
    "/certificates/"
  ].freeze

  BUBBLE_CHOICE_CUSTOM_MODES = {
    MUSIC_DANCE_AI: 'music_dance_ai',
  }.freeze

  BUBBLE_CHOICE_NAVIGATION_TYPES = {
    PARENT: 'parent',
    NEXT_LEVEL: 'next_level',
  }

  # Web Lab 2 and App Lab projects use the same list of allowed hostnames.
  # These are the hostnames that users are allowed to make requests to in their projects.
  # SECURITY CONSIDERATIONS:
  # - These APIs are allowlisted to let students make web requests in their projects
  # - All APIs should be public, well-documented, and not require authentication for basic usage
  # - APIs that require API keys should be documented as such.  These risk student exposure to the API keys.
  # There has been a best effort to determine which APIs use keys and which are public.
  # If an API is not specified as either, it means we can not determine if it requires a key or not.
  # Some API descriptions have been generated by AI and spot-checked for accuracy, but may contain errors.
  ALLOWED_HOSTNAME_SUFFIXES = [
    # === ENTERTAINMENT ===
    'api.themoviedb.org',         # Movie/TV data - API key required 🔑
    # === FINANCE & CRYPTOCURRENCY ===
    'api.coinlayer.com',          # Cryptocurrency exchange rates - API key required 🔑
    'pro-api.coinmarketcap.com',  # Cryptocurrency market data - API key required 🔑
    'api.exchangeratesapi.io',    # Currency exchange rates - API key required 🔑
    'currencyapi.com',            # Currency data - API key required 🔑
    'moneyconvert.net',           # Exchange rate data - Public API
    'quandl.com',                 # Financial datasets - API key required 🔑
    # === FUN AND GAMES ===
    'api.blizzard.com',           # Blizzard gaming data - API key required 🔑
    'api.nookipedia.com',         # Animal Crossing data -  API key required 🔑
    'api.mojang.com',             # Minecraft game data - Public API
    'api.scryfall.com',           # Magic: The Gathering cards - Public API
    'api.sportsdata.io',          # Sports data feeds - API key required 🔑
    'ch.tetr.io',                 # Tetris game data - Public API
    'deckofcardsapi.com',         # Deck of cards - Public API
    'openlibrary.org',            # Open Library APIs - Public API
    'opentdb.com',                # Trivia questions - Public API
    'pokeapi.co',                 # Pokémon data - Public API
    'roblox.com',                 # Roblox game data - API key required 🔑
    'runescape.com',              # RuneScape game data - Public API
    'sessionserver.mojang.com',   # Minecraft session data - Public API
    'stats.minecraftservers.org', # Minecraft server stats - Public API
    'textures.minecraft.net',     # Minecraft textures - Public API
    'thecatapi.com',              # Cat photos - API key required 🔑
    'thedogapi.com',              # Dog photos - API key required 🔑
    # === GOVERNMENT ===
    # SECURITY: Government APIs are generally well-maintained and secure
    'api.census.gov',             # US Census data - Public API
    'api.energidataservice.dk',   # Danish energy data - Public API
    'api.fda.gov',                # FDA data - Public API
    'api.nal.usda.gov',           # USDA data
    'api.si.edu',                 # Smithsonian data - API key required 🔑
    'api-v3.mbta.com',            # Boston transit data
    'data.austintexas.gov',       # Austin city data
    'data.cityofchicago.org',     # Chicago city data
    'data.gv.at',                 # Austrian government data
    'rejseplanen.dk',             # Denmark public transport
    'transitchicago.com',         # Chicago transit - API key required 🔑
    'vpic.nhtsa.dot.gov',         # Vehicle data - Public API
    # === SPACE ===
    'api.nasa.gov',               # NASA content - API key required 🔑
    'api.open-notify.org',        # ISS location and space data - Public API
    'api.spacexdata.com',         # SpaceX data - Public API
    'data.nasa.gov',              # NASA datasets
    'hubblesite.org',             # Hubble telescope data
    'images-api.nasa.gov',        # NASA images - API key required 🔑
    # === WEATHER & CLIMATE ===
    # SECURITY: Weather APIs are generally reliable and well-maintained
    'api.open-meteo.com',          # Weather data - Public API
    'api.weather.gov',             # US National Weather Service - Public API
    'api.weatherapi.com',          # Weather data - API key required 🔑
    'api.openweathermap.org',      # Weather data - API key required 🔑
    'api.waqi.info',               # Air quality data - API key required 🔑
    'dataservice.accuweather.com', # Weather data - API key required 🔑
    'data.weather.gov.hk',         # Hong Kong weather
    'noaa.gov',                    # Weather/climate data - API key required 🔑
    # === PLACES & GEOGRAPHY ===
    # SECURITY: Geographic APIs are generally safe for educational use
    'api.foursquare.com',       # Points of interest - API key required 🔑
    'api.opencagedata.com',     # Geocoding - API key required 🔑
    'api.openrouteservice.org', # Directions/routing - API key required 🔑
    'api.zippopotam.us',        # Postal codes - Public API
    'restcountries.com',        # Country information - Public API
    'worldclockapi.com',        # Time zones - Public API
    'worldtimeapi.org',         # Time zones - Public API
    # === MATH ===
    # SECURITY: Simple utility APIs with minimal security concerns
    'api.mathjs.org',           # Mathematical expressions - Public API
    # REMOVED: 'numbersapi.com' - HIGH RISK: DNS resolves but no HTTP/HTTPS service available
    'qrng.anu.edu.au',          # Random numbers - Public API
    'random.org',               # Random number generation - API Key required 🔑
    'api.wolframalpha.com',     # Computational knowledge engine - API key required 🔑
    # === TOOLS & INTEGRATIONS ===
    # SECURITY: Some require authentication, others are public
    'api.github.com',           # GitHub data - Public API, rate limited
    'io.adafruit.com',          # Adafruit IO - API key required 🔑
    'maker.ifttt.com',          # IFTTT webhooks
    'googleapis.com',           # Google Services - API key required 🔑
    'api.rebrandly.com',        # URL shortening - API key required 🔑
    # === CONTENT & MEDIA ===
    # SECURITY: Content APIs are generally safe for educational use
    'api.spotify.com',          # Spotify music data - API key required 🔑
    'itunes.apple.com',         # iTunes/App Store data - Public API
    'pixabay.com',              # Photos/videos - API key required 🔑
    'wikipedia.org',            # Wikipedia content - Public API
    'xeno-canto.org',           # Bird sounds - API key required 🔑
    # === WORDS & TEXTS ===
    'api.datamuse.com',         # Word-finding engine - Public API
    'gutendex.com',             # Project Gutenberg ebook metadata - Public API
    'api.scripture.api.bible',  # Bible verses - API key required 🔑
    # === OTHER ===
    # SECURITY: Varies by API, most are public educational resources
    'api.amadeus.com',          # Travel/flight data - API key required 🔑
    'api.arasaac.org',          # AAC symbols - Public API
    'api.randomuser.me',        # Random user data - Public API
    'api.thingspeak.com',       # Analyze live data streams - API key required for private channels 🔑
    'api.spoonacular.com',      # Food/recipe data - API key required 🔑
    'native-land.ca',           # Indigenous territories - API key required 🔑
    'perenual.com',             # Botanical data - API key required 🔑
    'serpapi.com',              # Search engine results - Public API
    'newsapi.org',              # News data - API key required 🔑
    # REMOVED: 'myschoolapp.com' - HIGH RISK: DNS resolves but no HTTP/HTTPS service available
    'isenseproject.org',        # Sensor data - Public API
    'lakeside-cs.org',          # Educational data - Public API
    # === INTERNAL ===
    # These enable functionality within the Code.org ecosystem
    # For example, so applab apps can access the tables and properties of other applab apps.
    'code.org',
    # === LEGACY/DEPRECATED ===
    # These are maintained for backward compatibility
    # These seemed deprecated/have inactive websites as of 9/3/2025
    # SECURITY: Should be reviewed for continued necessity
    'api.pegelalarm.at',        # Water level data
    # REMOVED: 'api.quotable.io' - HIGH RISK: Domain does not resolve
    'bnefoodtrucks.com.au',     # Brisbane food trucks
    'covidtracking.com',        # COVID data (deprecated) - Public API
    'cryptonator.com',          # Cryptocurrency data
    # REMOVED: 'distanza.org' - HIGH RISK: DNS resolves but no HTTP/HTTPS service available
    # REMOVED: 'githubusercontent.com' - HIGH RISK: Domain does not resolve
    # REMOVED: 'grobchess.com' - HIGH RISK: DNS resolves but no HTTP/HTTPS service available
    'open.mapquestapi.com',     # MapQuest mapping services
    'swapi.dev',                # Star Wars data. We may want to remove this in favor of swapi.info
    # REMOVED: 'theunitedstates.io' - HIGH RISK: DNS resolves but no HTTP/HTTPS service available
  ].freeze

  ALLOWED_IMAGE_HOSTNAME_SUFFIXES = [
    'picsum.photos' # Placeholder images - Public API
  ].freeze

  ALLOWED_FONT_HOSTNAMES = [
    # These hostnames are used to load google fonts. Public API.
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ].freeze
end
