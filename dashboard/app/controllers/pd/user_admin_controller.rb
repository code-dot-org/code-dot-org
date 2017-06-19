class Pd::UserAdminController < ApplicationController
  authorize_resource class: :pd_user_admin

  def find_user
    @permissions = Array.new
    search_term = user_admin_params[:search_term]
    if search_term =~ /^\d+$/
      user_id = search_term
      @user = User.find(user_id)
    else
      email = search_term
      @user = User.find_by(email: email) # This retrieves the first result if there are multiple users with the same email address
    end
    @permissions = @user.permissions if @user
  end

  def assign_permission
    user_id = user_admin_params[:user_id]
    @permission = user_admin_params[:permission]
    @user = User.find(user_id)
  end

  private

  # white list permitted request parameters
  def user_admin_params
    params.permit(:search_term, :user_id, :permission)
  end
end
