class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get the courses that this user teaches
    workshops = Pd::Workshop.enrolled_in_by(current_user)
    ended_workshops = workshops.in_state(Pd::Workshop::STATE_ENDED)

    courses_teaching = workshops.pluck(:course).uniq
    courses_completed = ended_workshops.pluck(:course).uniq

    enrollments = Pd::Enrollment.where(email: current_user.email)
    surveys_pending_enrollment = Pd::Enrollment.filter_for_survey_completion(enrollments, false)
    last_pending_enrollment = surveys_pending_enrollment && surveys_pending_enrollment.max_by(&:survey_sent_at)

    # Link to the certificate
    @landing_page_data = {
      courses_teaching: courses_teaching,
      courses_completed: courses_completed,
      last_workshop_survey_url: last_pending_enrollment && CDO.code_org_url("/pd-workshop-survey/#{last_pending_enrollment.code}"),
      last_workshop_survey_course: last_pending_enrollment.try(:workshop).try(:course)
    }
  end
end
