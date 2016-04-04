class AdminUsersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  def assume_identity_form
  end

  def assume_identity
    user = User.where(id: params[:user_id]).first if params[:user_id].to_i.to_s == params[:user_id]
    user ||= User.where(username: params[:user_id]).first
    user ||= User.find_by_email_or_hashed_email(params[:user_id])

    if user
      sign_in user, :bypass => true
      redirect_to '/'
    else
      flash[:alert] = 'User not found'
      render :assume_identity_form
    end
  end

  def confirm_email_form
  end

  def confirm_email
    user = User.find_by_email_or_hashed_email(params[:email])

    if user
      user.confirm
      user.save!
      flash[:alert] = 'Email confirmed!'
      redirect_to confirm_email_form_path
    else
      flash[:alert] = 'User not found -- email not confirmed'
      render :confirm_email_form
    end
  end

end
