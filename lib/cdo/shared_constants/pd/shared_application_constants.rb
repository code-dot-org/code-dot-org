module Pd
  module SharedApplicationConstants
    # These constants are shared across rails and js so that the display strings can be tied to
    # the current application year on both sides.
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
      YEAR_22_23 = '2022-2023'.freeze,
      YEAR_23_24 = '2023-2024'.freeze
    ].freeze

    APPLICATION_CURRENT_YEAR = YEAR_22_23

    COHORT_CALCULATOR_STATUSES = %w(
      accepted
      accepted_not_notified
      accepted_notified_by_partner
      accepted_no_cost_registration
      registration_sent
      paid
    )

    COHORT_VIEW_STATUSES = COHORT_CALCULATOR_STATUSES + ['withdrawn']
  end
end
