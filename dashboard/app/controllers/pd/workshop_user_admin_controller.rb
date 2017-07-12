class Pd::WorkshopUserAdminController < ApplicationController
  authorize_resource class: :pd_workshop_user_admin

  # display the Facilitator search form, Facilitators found, and Courses for first Facilitator found
  # assign / remove Courses actions redirect back to this form to display the updated course list
  def facilitator_courses_form
    search_term = facilitator_course_params[:search_term]
    if search_term =~ /^\d+$/
      facilitator_id = search_term
      @facilitators = User.joins(:permissions).where(id: facilitator_id, user_permissions: {permission: UserPermission::FACILITATOR})
    elsif search_term
      email = search_term
      hashed_email = User.hash_email(email)
      # use where instead of find because in rare cases there may be multiple Users with the same email address
      @facilitators = User.joins(:permissions).where(hashed_email: hashed_email, user_permissions: {permission: UserPermission::FACILITATOR})
    end

    @facilitator = @facilitators.first if @facilitators
    unless @facilitator || search_term.blank?
      flash[:notice] = "Facilitator not found"
    end
    @courses = Pd::CourseFacilitator.where(facilitator_id: @facilitator.id) if @facilitator
  end

  def assign_course
    Pd::CourseFacilitator.create(facilitator_id: facilitator_course_params[:facilitator_id], course: facilitator_course_params[:course])
    redirect_to action: "facilitator_courses_form", search_term: facilitator_course_params[:facilitator_id]
  end

  def remove_course
    Pd::CourseFacilitator.find(facilitator_course_params[:course_facilitator_id]).try(:destroy)
    redirect_to action: "facilitator_courses_form", search_term: facilitator_course_params[:facilitator_id]
  end

  private

  # white list permitted request parameters
  def facilitator_course_params
    params.permit(:search_term, :facilitator_id, :course, :course_facilitator_id)
  end
end
