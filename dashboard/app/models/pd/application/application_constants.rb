module Pd::Application
  module ApplicationConstants
    APPLICATION_TYPES = [
      TEACHER_APPLICATION = 'Teacher'.freeze,
      FACILITATOR_APPLICATION = 'Facilitator'.freeze,
      PRINCIPAL_APPROVAL_APPLICATION = 'Principal Approval'.freeze
    ].freeze

    APPLICATION_YEARS = [
      YEAR_18_19 = '2018-2019'.freeze,
      YEAR_19_20 = '2019-2020'.freeze,
      YEAR_20_21 = '2020-2021'.freeze
    ].freeze

    COURSE_NAMES = {
      csd: 'Computer Science Discoveries',
      csp: 'Computer Science Principles'
    }.stringify_keys

    YES = 'Yes'.freeze
    NO = 'No'.freeze
    REVIEWING_INCOMPLETE = 'Reviewing Incomplete'.freeze
  end
end
