module Pd
  module JotForm
    module Constants
      QUESTION_TYPES = [
        TYPE_TEXTBOX = 'textbox'.freeze,
        TYPE_TEXTAREA = 'textarea'.freeze,
        TYPE_NUMBER = 'number'.freeze,
        TYPE_DROPDOWN = 'dropdown'.freeze,
        TYPE_RADIO = 'radio'.freeze,
        TYPE_CHECKBOX = 'checkbox'.freeze,
        TYPE_SCALE = 'scale'.freeze,
        TYPE_MATRIX = 'matrix'.freeze,
        TYPE_BUTTON = 'button'.freeze,
        TYPE_DIVIDER = 'divider'.freeze,
        TYPE_TEXT = 'text'.freeze
      ].freeze

      IGNORED_QUESTION_TYPES = [
        TYPE_HEADING = 'heading'.freeze,
        TYPE_BUTTON = 'button'.freeze,
        TYPE_DIVIDER = 'divider'.freeze,
        TYPE_TEXT = 'text'.freeze,
        TYPE_PAGEBREAK = 'pagebreak'.freeze,
        TYPE_DIVIDER = 'divider'.freeze,
        TYPE_HEAD = 'head'.freeze,
        TYPE_WIDGET = 'widget'.freeze
      ].freeze

      ANSWER_TYPES = [
        ANSWER_TEXT = 'text'.freeze,

        # We can convert the text response to a numeric value for certain single select controls
        # (radio, dropdown, scale, part of a matrix).
        ANSWER_SELECT_VALUE = 'selectValue'.freeze,
        ANSWER_SELECT_TEXT = 'selectText'.freeze,

        # Multi-select is always text
        ANSWER_MULTI_SELECT = 'multiSelect'.freeze,

        # No answer, just question metadata, e.g. matrix heading
        ANSWER_NONE = 'none'.freeze
      ].freeze

      SURVEY_REPORT_TYPES = [
        TYPE_SCALE,
        TYPE_TEXTAREA,
        TYPE_MATRIX
      ]
    end
  end
end
