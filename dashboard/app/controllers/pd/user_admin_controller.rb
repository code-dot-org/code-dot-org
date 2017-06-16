class Pd::UserAdminController < ApplicationController
  authorize_resource class: :pd_user_admin

  def find_user
    @permissions = Array.new
    email = params[:email]
    if email
      @user = User.where(email: email).first # use the first result if there are multiple users with the same email address
    end
    user_id = params[:user_id]
    if user_id
      @user = User.find(user_id)
    end
    @permissions = @user.permissions if @user
  end
end
