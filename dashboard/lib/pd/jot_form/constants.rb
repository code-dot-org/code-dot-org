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
        TYPE_DATETIME = 'datetime'.freeze,
      ].freeze

      IGNORED_QUESTION_TYPES = [
        TYPE_HEADING = 'head'.freeze,
        TYPE_BUTTON = 'button'.freeze,
        TYPE_DIVIDER = 'divider'.freeze,
        TYPE_TEXT = 'text'.freeze,
        TYPE_PAGEBREAK = 'pagebreak'.freeze,
        TYPE_HEAD = 'head'.freeze,
        TYPE_WIDGET = 'widget'.freeze,
        TYPE_IMAGE = 'image'.freeze,
        TYPE_RATING = 'rating'.freeze,
      ].freeze

      ANSWER_TYPES = [
        ANSWER_TEXT = 'text'.freeze,
        ANSWER_SCALE = 'scale'.freeze,
        ANSWER_SINGLE_SELECT = 'singleSelect'.freeze,
        ANSWER_MULTI_SELECT = 'multiSelect'.freeze,
        # No answer, just question metadata, e.g. matrix heading
        ANSWER_NONE = 'none'.freeze,
        # Don't know answer type of a question
        ANSWER_UNKNOWN = 'unknown'.freeze
      ].freeze

      QUESTION_TO_ANSWER_TYPES = {
        TYPE_TEXTBOX => ANSWER_TEXT,
        TYPE_TEXTAREA => ANSWER_TEXT,
        TYPE_NUMBER => ANSWER_TEXT,
        TYPE_DATETIME => ANSWER_TEXT,
        TYPE_DROPDOWN => ANSWER_SINGLE_SELECT,
        TYPE_RADIO => ANSWER_SINGLE_SELECT,
        TYPE_CHECKBOX => ANSWER_MULTI_SELECT,
        TYPE_MATRIX => ANSWER_MULTI_SELECT,
        TYPE_SCALE => ANSWER_SCALE
      }.freeze

      SURVEY_REPORT_TYPES = [
        TYPE_SCALE,
        TYPE_TEXTAREA,
        TYPE_MATRIX,
      ]
    end
  end
end
