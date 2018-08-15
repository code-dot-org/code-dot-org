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
      ].freeze

      IGNORED_QUESTION_TYPES = [
        TYPE_HEADING = 'head'.freeze,
        TYPE_BUTTON = 'button'.freeze,
        TYPE_DIVIDER = 'divider'.freeze,
        TYPE_TEXT = 'text'.freeze,
        TYPE_PAGEBREAK = 'pagebreak'.freeze,
        TYPE_HEAD = 'head'.freeze,
        TYPE_WIDGET = 'widget'.freeze
      ].freeze

      ANSWER_TYPES = [
        ANSWER_TEXT = 'text'.freeze,

        ANSWER_SCALE = 'scale'.freeze,

        ANSWER_SINGLE_SELECT = 'singleSelect'.freeze,
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
