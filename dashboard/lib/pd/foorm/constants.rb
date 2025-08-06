module Pd::Foorm
  module Constants
    QUESTION_TYPES = [
      TYPE_TEXT = 'text'.freeze,
      TYPE_RADIO = 'radiogroup'.freeze,
      TYPE_CHECKBOX = 'checkbox'.freeze,
      TYPE_DROPDOWN = 'dropdown'.freeze,
      TYPE_RATING = 'rating'.freeze,
      TYPE_MATRIX = 'matrix'.freeze,
      TYPE_COMMENT = 'comment'.freeze,
      TYPE_BOOLEAN = 'boolean'.freeze
    ].freeze

    PANEL_TYPES = [
      TYPE_PANEL = 'panel'.freeze,
      TYPE_PANEL_DYNAMIC = 'paneldynamic'.freeze
    ]

    ANSWER_TYPES = [
      ANSWER_TEXT = 'text'.freeze,
      ANSWER_SINGLE_SELECT = 'singleSelect'.freeze,
      ANSWER_MULTI_SELECT = 'multiSelect'.freeze,
      ANSWER_MATRIX = 'matrix'.freeze,
      ANSWER_RATING = 'scale'.freeze,
      ANSWER_BOOLEAN = 'boolean'.freeze,
      # No answer, just question metadata, e.g. matrix heading
      ANSWER_NONE = 'none'.freeze,
      # Don't know answer type of a question
      ANSWER_UNKNOWN = 'unknown'.freeze
    ]

    QUESTION_TO_ANSWER_TYPES = {
      TYPE_TEXT => ANSWER_TEXT,
      TYPE_COMMENT => ANSWER_TEXT,
      TYPE_RADIO => ANSWER_SINGLE_SELECT,
      TYPE_DROPDOWN => ANSWER_SINGLE_SELECT,
      TYPE_CHECKBOX => ANSWER_MULTI_SELECT,
      TYPE_RATING => ANSWER_SINGLE_SELECT,
      TYPE_MATRIX => ANSWER_MATRIX,
      TYPE_RATING => ANSWER_RATING,
      TYPE_BOOLEAN => ANSWER_BOOLEAN
    }

    ROLLUP_CONFIGURATION_FILE = 'config/foorm/rollups/rollups_by_course.json'

    # Likert scale conversion: 1→0, 2→17, 3→33, 4→50, 5→67, 6→83, 7→100
    LIKERT_WEIGHTS = {
      1 => 0,
      2 => 17,
      3 => 33,
      4 => 50,
      5 => 67,
      6 => 83,
      7 => 100
    }.freeze

    PROMOTER_THRESHOLD = 7
    AGREEMENT_THRESHOLD = 5

    LIKERT_MIN_RATING = 1
    LIKERT_MAX_RATING = 7

    PROMOTER_MIN_RATING = 0
    PROMOTER_MAX_RATING = 10

    DEFAULT_MIN_RATING = 1
    DEFAULT_MAX_RATING = 5
  end
end
