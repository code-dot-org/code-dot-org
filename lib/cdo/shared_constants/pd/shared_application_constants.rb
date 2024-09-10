module Pd
  module SharedApplicationConstants
    # These constants are shared across rails and js so that the display strings can be tied to
    # the current application year on both sides.
    APPLICATION_TYPES = [
      TEACHER_APPLICATION = 'Teacher'.freeze,
      FACILITATOR_APPLICATION = 'Facilitator'.freeze,
      PRINCIPAL_APPROVAL_APPLICATION = 'Administrator Approval'.freeze
    ].freeze

    APPLICATION_YEARS = [
      YEAR_18_19 = '2018-2019'.freeze,
      YEAR_19_20 = '2019-2020'.freeze,
      YEAR_20_21 = '2020-2021'.freeze,
      YEAR_21_22 = '2021-2022'.freeze,
      YEAR_22_23 = '2022-2023'.freeze,
      YEAR_23_24 = '2023-2024'.freeze,
      YEAR_24_25 = '2024-2025'.freeze,
      YEAR_25_26 = '2025-2026'.freeze,
      YEAR_26_27 = '2026-2027'.freeze
    ].freeze

    APPLICATION_CURRENT_YEAR = YEAR_25_26
    NEXT_APPLICATION_YEAR = YEAR_26_27

    COHORT_CALCULATOR_STATUSES = %w(
      accepted
      enrolled
    )
  end
end
