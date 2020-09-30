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
      YEAR_20_21 = '2020-2021'.freeze,
      YEAR_21_22 = '2021-2022'.freeze,
      YEAR_22_23 = '2022-2023'.freeze
    ].freeze

    APPLICATION_YEARS_SHORT = [
      YEAR_21_22_SHORT = '2021-22'.freeze,
      YEAR_22_23_SHORT = '2022-23'.freeze
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
