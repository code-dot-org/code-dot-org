class Pd::WorkshopUserAdminController < ApplicationController
  authorize_resource class: :pd_workshop_user_admin

  # display the Facilitator search form, Facilitators found, and Courses for first Facilitator found
  # assign / remove Courses actions redirect back to this form to display the updated course list
  def facilitator_courses_form
    search_term = facilitator_course_params[:search_term]
    if search_term =~ /^\d+$/
      user_id = search_term
      @facilitators = User.where(id: user_id)
    elsif search_term
      email = search_term
      hashed_email = User.hash_email(email)
      @facilitators = User.where(hashed_email: hashed_email)
    end
    @facilitator = @facilitators.first if @facilitators
  end

  private

  # white list permitted request parameters
  def facilitator_course_params
    params.permit(:search_term, :user_id, :course)
  end
end
