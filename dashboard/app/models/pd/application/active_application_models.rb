module Pd
  module Application
    module ActiveApplicationModels
      include ApplicationConstants

      APPLICATION_CURRENT_YEAR = YEAR_21_22

      # Active (this year's) application classes and factories
      TEACHER_APPLICATION_CLASS = Teacher2122Application
      PRINCIPAL_APPROVAL_APPLICATION_CLASS = PrincipalApproval2122Application
      FACILITATOR_APPLICATION_CLASS = Facilitator1920Application

      TEACHER_APPLICATION_FACTORY = :pd_teacher2122_application
      TEACHER_APPLICATION_HASH_FACTORY = :pd_teacher2122_application_hash
      PRINCIPAL_APPROVAL_FACTORY = :pd_principal_approval2122_application
      PRINCIPAL_APPROVAL_HASH_FACTORY = :pd_principal_approval2122_application_hash
      FACILITATOR_APPLICATION_FACTORY = :pd_facilitator1920_application
      FACILITATOR_APPLICATION_HASH_FACTORY = :pd_facilitator1920_application_hash

      FIT_WEEKEND_REGISTRATION_CLASS = Pd::FitWeekend1920Registration

      FIT_WEEKEND_REGISTRATION_FACTORY = :pd_fit_weekend1920_registration
      FIT_WEEKEND_REGISTRATION_SYMBOL = :pd_fit_weekend1920_registration
      FIT_WEEKEND_REGISTRATION_HASH_FACTORY = :pd_fit_weekend1920_registration_hash
    end
  end
end
