module Pd
  module SharedApplicationConstants
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
