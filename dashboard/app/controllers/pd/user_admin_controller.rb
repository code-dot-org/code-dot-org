class Pd::UserAdminController < ApplicationController
  authorize_resource class: :pd_user_admin

  def find_user
    @permissions = Array.new
    search_term = user_admin_params[:search_term]
    if search_term =~ /^\d+$/
      user_id = search_term
      @user = User.find_by(id: user_id)
    else
      email = search_term
      @user = User.find_by(email: email) # This retrieves the first result if there are multiple users with the same email address
    end
    @permissions = @user.permissions if @user
  end

  def assign_permission
    user_id = user_admin_params[:user_id]
    @user = User.find(user_id)
    @user.permission = user_admin_params[:pd_user_permission_id]
    redirect_to action: "find_user", search_term: user_id
  end

  private

  # white list permitted request parameters
  def user_admin_params
    params.permit(:search_term, :user_id, :pd_user_permission_id)
  end
end
