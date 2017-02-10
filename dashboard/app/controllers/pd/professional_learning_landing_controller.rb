class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get the courses that this user teaches
    workshops = Pd::Workshop.enrolled_in_by(current_user)
    courses_teaching = workshops.pluck(:course).uniq

    # Link to the certificate
    @landing_page_data = {
      courses_teaching: courses_teaching
    }
  end
end
