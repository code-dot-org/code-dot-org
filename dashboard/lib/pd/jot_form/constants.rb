module Pd
  module JotForm
    module Constants
      include SharedWorkshopConstants

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

      FORM_CATEGORIES = [
        LOCAL_CATEGORY = 'local_summer',
        ACADEMIC_YEAR_1_CATEGORY = 'academic_year_1',
        ACADEMIC_YEAR_2_CATEGORY = 'academic_year_2',
        ACADEMIC_YEAR_3_CATEGORY = 'academic_year_3',
        ACADEMIC_YEAR_4_CATEGORY = 'academic_year_4',
        ACADEMIC_YEAR_1_2_CATEGORY = 'academic_year_1_2',
        ACADEMIC_YEAR_3_4_CATEGORY = 'academic_year_3_4',
      ]

      CATEGORY_MAP = {
        SUBJECT_CSP_SUMMER_WORKSHOP => LOCAL_CATEGORY,
        SUBJECT_CSP_WORKSHOP_1 => ACADEMIC_YEAR_1_CATEGORY,
        SUBJECT_CSP_WORKSHOP_2 => ACADEMIC_YEAR_2_CATEGORY,
        SUBJECT_CSP_WORKSHOP_3 => ACADEMIC_YEAR_3_CATEGORY,
        SUBJECT_CSP_WORKSHOP_4 => ACADEMIC_YEAR_4_CATEGORY,
        SUBJECT_CSP_WORKSHOP_5 => ACADEMIC_YEAR_1_2_CATEGORY,
        SUBJECT_CSP_WORKSHOP_6 => ACADEMIC_YEAR_3_4_CATEGORY,
        SUBJECT_CSP_TEACHER_CON => LOCAL_CATEGORY,
        SUBJECT_CSD_SUMMER_WORKSHOP => LOCAL_CATEGORY,
        SUBJECT_CSD_UNITS_2_3 => ACADEMIC_YEAR_1_CATEGORY,
        SUBJECT_CSD_UNIT_3_4 => ACADEMIC_YEAR_2_CATEGORY,
        SUBJECT_CSD_UNITS_4_5 => ACADEMIC_YEAR_3_CATEGORY,
        SUBJECT_CSD_UNIT_6 => ACADEMIC_YEAR_4_CATEGORY,
        SUBJECT_CSD_UNITS_1_3 => ACADEMIC_YEAR_1_2_CATEGORY,
        SUBJECT_CSD_UNITS_4_6 => ACADEMIC_YEAR_3_4_CATEGORY,
        SUBJECT_CSD_TEACHER_CON => LOCAL_CATEGORY,
      }
    end
  end
end
