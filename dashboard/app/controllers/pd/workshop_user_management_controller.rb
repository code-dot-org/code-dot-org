class Pd::WorkshopUserManagementController < ApplicationController
  authorize_resource class: :pd_workshop_user_management

  # get /pd/workshop_user_management/facilitator_courses
  def facilitator_courses_form
    search_term = params[:search_term]
    if search_term =~ /^\d+$/
      @facilitator = User.joins(:permissions).find_by(
        id: search_term,
        user_permissions: {permission: UserPermission::FACILITATOR}
      )
    elsif search_term
      @facilitator = User.joins(:permissions).find_by(
        hashed_email: User.hash_email(search_term),
        user_permissions: {permission: UserPermission::FACILITATOR}
      )
    end

    unless @facilitator || search_term.blank?
      flash[:notice] = "Facilitator not found"
    end
  end

  # post /pd/workshop_user_management/assign_course
  def assign_course
    User.find(params[:facilitator_id]).try(:course_as_facilitator=, params[:course])
    redirect_to action: "facilitator_courses_form", search_term: params[:facilitator_id]
  end

  # get /pd/workshop_user_management/remove_course
  def remove_course
    User.find(params[:facilitator_id]).try(:delete_course_as_facilitator, params[:course])
    redirect_to action: "facilitator_courses_form", search_term: params[:facilitator_id]
  end
end
