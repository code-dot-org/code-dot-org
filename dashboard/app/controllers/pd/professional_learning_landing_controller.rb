class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get the courses that this user teaches
    workshops = Pd::Workshop.enrolled_in_by(current_user)
    ended_workshops = workshops.in_state(Pd::Workshop::STATE_ENDED)

    courses_teaching = workshops.pluck(:course).uniq
    courses_completed = ended_workshops.pluck(:course).uniq

    last_enrollment =  Pd::Enrollment.joins(:workshop).where(email: current_user.email).where('pd_enrollments.completed_survey_id IS NULL').order('pd_workshops.ended_at DESC').first

    # Link to the certificate
    @landing_page_data = {
      courses_teaching: courses_teaching,
      courses_completed: courses_completed,
      last_workshop_survey_url: "#{CDO.code_org_url}/pd-workshop-survey/#{last_enrollment.code}"
    }
  end
end
