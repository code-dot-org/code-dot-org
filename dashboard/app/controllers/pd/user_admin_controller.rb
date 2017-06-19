class Pd::UserAdminController < ApplicationController
  authorize_resource class: :pd_user_admin

  def find_user
    @permissions = Array.new
    email = user_admin_params[:email]
    if email
      @user = User.where(email: email).first # use the first result if there are multiple users with the same email address
    end
    user_id = user_admin_params[:user_id]
    if user_id
      @user = User.find(user_id)
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
    params.permit(:user_id, :email, :permission)
  end
end
