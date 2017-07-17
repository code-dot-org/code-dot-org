class Pd::WorkshopUserAdminController < ApplicationController
  authorize_resource class: :pd_workshop_user_admin

  # display the Facilitator search form, Facilitator found, and Courses assigned to the Facilitator
  # assign / remove Courses actions redirect back to this form to display the updated course list
  # get /pd/workshop_user_admin/facilitator_courses
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

  # post /pd/workshop_user_admin/assign_course
  def assign_course
    User.find(facilitator_course_params[:facilitator_id]).try(:course_as_facilitator=, facilitator_course_params[:course])
    redirect_to action: "facilitator_courses_form", search_term: facilitator_course_params[:facilitator_id]
  end

  # get /pd/workshop_user_admin/remove_course
  def remove_course
    User.find(facilitator_course_params[:facilitator_id]).try(:delete_course_as_facilitator, facilitator_course_params[:course])
    redirect_to action: "facilitator_courses_form", search_term: facilitator_course_params[:facilitator_id]
  end

  private

  # white list permitted request parameters
  def facilitator_course_params
    params.permit(:search_term, :facilitator_id, :course, :course_facilitator_id)
  end
end
