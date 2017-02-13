class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get the courses that this user teaches
    workshops = Pd::Workshop.enrolled_in_by(current_user)
    courses_teaching = workshops.pluck(:course).uniq
    courses_completed = workshops.in_state(Pd::Workshop::STATE_ENDED).pluck(:course).uniq

    # Link to the certificate
    @landing_page_data = {
      courses_teaching: courses_teaching,
      courses_completed: courses_completed
    }
  end
end
