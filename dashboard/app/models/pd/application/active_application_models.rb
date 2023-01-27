module Pd
  module Application
    module ActiveApplicationModels
      # The application current year constant controls logic in several places:
      # - changes the set of applications retrieved for the application dashboard (archives old ones)
      # - used to display the school year in the application form
      # - used to determine the current summer workshops year in summer_workshops_to_gdrive script
      # - used in two other scripts (teacher_applications_to_gdrive and scheduled_pd_application_emails)
      # - used for regional partner workshop enrollment counts
      APPLICATION_CURRENT_YEAR = Pd::SharedApplicationConstants::APPLICATION_CURRENT_YEAR

      # Active (this year's) application classes and factories
      TEACHER_APPLICATION_CLASS = TeacherApplication
      PRINCIPAL_APPROVAL_APPLICATION_CLASS = PrincipalApprovalApplication

      TEACHER_APPLICATION_FACTORY = :pd_teacher_application
      TEACHER_APPLICATION_HASH_FACTORY = :pd_teacher_application_hash
      PRINCIPAL_APPROVAL_FACTORY = :pd_principal_approval_application
      PRINCIPAL_APPROVAL_HASH_FACTORY = :pd_principal_approval_application_hash
    end
  end
end
