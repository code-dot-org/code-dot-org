# require_dependency File.join(File.dirname(__FILE__), 'teacher_common_application_constants')
# require_dependency 'teacher_common_application_constants'
# require_relative 'teacher_common_application_constants'

module Pd
  module Teacher1819ApplicationConstants
    include TeacherCommonApplicationConstants

    SECTION_HEADERS = BASE_SECTION_HEADERS.freeze
    PAGE_LABELS = BASE_PAGE_LABELS.freeze

    ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
    ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze
  end
end
