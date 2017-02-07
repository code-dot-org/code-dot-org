class Pd::ProfessionalLearningLandingController < ApplicationController
  before_action :require_admin

  def index
    # Get workshops that the user is enrolled in with an outstanding survey
    workshops = Pd::Workshop.enrolled_in_by(current_user)
    courses_teaching = workshops.pluck(:course).uniq

    # Link to the certificate
    @landing_page_data = {
      courses_teaching: courses_teaching
    }
  end
end
