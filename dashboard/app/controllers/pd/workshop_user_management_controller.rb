class Pd::WorkshopUserManagementController < ApplicationController
  authorize_resource class: :pd_workshop_user_management

  # restrict the PII returned by the controller to the view by selecting only these columns from the model
  RESTRICTED_USER_ATTRIBUTES_FOR_VIEW = %w(
    users.id
    email
    name
    user_type
    current_sign_in_at
    sign_in_count
    users.created_at
    provider
  ).freeze

  # get /pd/workshop_user_management/facilitator_courses
  def facilitator_courses_form
    search_term = params[:search_term]
    if search_term =~ /^\d+$/
      @user = restricted_users.find_by(id: search_term)
    elsif search_term
      @user = restricted_users.find_by(hashed_email: restricted_users.hash_email(search_term))
    end

    unless @user || search_term.blank?
      flash[:notice] = "No user with email/id <#{search_term}> found."
    end
  end

  # post /pd/workshop_user_management/assign_course
  def assign_course_to_facilitator
    @user = restricted_users.find(params[:user_id])
    @user.course_as_facilitator = params[:course]
    # grant facilitator permission the first time a course is assigned to a user
    @user.permission = UserPermission::FACILITATOR unless @user.facilitator?
    redirect_to action: "facilitator_courses_form", search_term: params[:user_id]
  end

  # get /pd/workshop_user_management/remove_course
  def remove_course_from_facilitator
    @user = restricted_users.find(params[:user_id])
    @user.delete_course_as_facilitator(params[:course])
    # revoke facilitator permission when removing the last course from a user
    @user.delete_permission(UserPermission::FACILITATOR) if @user.reload.courses_as_facilitator.none?
    redirect_to action: "facilitator_courses_form", search_term: params[:user_id]
  end

  private

  def restricted_users
    User.select(RESTRICTED_USER_ATTRIBUTES_FOR_VIEW)
  end
end
