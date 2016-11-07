require 'digest/md5'

class AdminUsersController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin

  def account_repair_form
  end

  def account_repair
    return unless params[:email]
    hashed_email = Digest::MD5.hexdigest(params[:email])
    teacher = User.where(user_type: User::TYPE_TEACHER).
      where(hashed_email: hashed_email).
      where(email: '').
      first

    if teacher
      teacher.update!(email: params[:email])
      flash[:alert] = 'User fixed.'
    else
      flash[:alert] = 'Malformed teacher not found.'
    end

    render :account_repair_form
  end

  def assume_identity_form
  end

  def assume_identity
    user = User.where(id: params[:user_id]).first if params[:user_id].to_i.to_s == params[:user_id]
    user ||= User.where(username: params[:user_id]).first
    user ||= User.find_by_email_or_hashed_email(params[:user_id])

    if user
      bypass_sign_in user
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

  def undelete_user
    user = User.only_deleted.find_by_id(params[:user_id])
    if user
      user.deleted_at = nil
      user.save!
      flash[:alert] = "User (ID: #{params[:user_id]}) Undeleted!"
    else
      flash[:alert] = "User (ID: #{params[:user_id]}) not found or undeleted"
    end
    redirect_to :find_students
  end
end
