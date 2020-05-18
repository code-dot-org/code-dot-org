module Pd::Foorm
  module Constants
    QUESTION_TYPES = [
      TYPE_TEXT = 'text'.freeze,
      TYPE_RADIO = 'radiogroup'.freeze,
      TYPE_CHECKBOX = 'checkbox'.freeze,
      TYPE_DROPDOWN = 'dropdown'.freeze,
      TYPE_RATING = 'rating'.freeze,
      TYPE_MATRIX = 'matrix'.freeze,
      TYPE_COMMENT = 'comment'.freeze
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
      TYPE_RATING => ANSWER_RATING
    }

    ROLLUP_CONFIGURATION_FILE = 'config/foorm/rollups/rollups_by_course.json'
  end
end
