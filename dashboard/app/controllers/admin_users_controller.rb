require 'digest/md5'

require 'cdo/activity_constants'

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

  def undelete_user
    user = User.only_deleted.find_by_id(params[:user_id])
    if user
      user.restore
      flash[:alert] = "User (ID: #{params[:user_id]}) Undeleted!"
    else
      flash[:alert] = "User (ID: #{params[:user_id]}) not found or undeleted"
    end
    redirect_to :find_students
  end

  def manual_pass_form
  end

  def manual_pass
    user = User.find_by_id(params[:user_id])
    unless user
      flash[:alert] = "User (ID: #{params[:user_id]}) not found"
    end
    script = nil
    if params[:script_id_or_name].to_i.to_s == params[:script_id_or_name]
      script = Script.find_by_id(params[:script_id_or_name])
    else
      script = Script.find_by_name(params[:script_id_or_name])
    end
    unless script
      flash[:alert] = "Script (ID or Name: #{params[:script_id_or_name]}) not found"
    end
    level = Level.find_by_id(params[:level_id])
    unless level
      flash[:alert] = "Level (ID: #{params[:level_id]}) not found"
    end

    unless user && script && level
      redirect_to :manual_pass_form
      return
    end

    user_level = UserLevel.find_or_initialize_by(
      user: user,
      script: script,
      level: level
    )
    if user_level.persisted? &&
      user_level.best_result > ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT
      flash[:alert] = "UserLevel (ID: #{user_level.id}) already green"
      redirect_to :manual_pass_form
      return
    end

    user_level.best_result = ActivityConstants::MANUAL_PASS_RESULT
    user_level.save!

    flash[:alert] = "UserLevel (ID: #{user_level.id}) updated"
    redirect_to :manual_pass_form
  end

  def permissions_form
  end

  # Grants the indicated permission to the indicated user. Expects params[:email] and
  # params[:permission] to be populated.
  def grant_permission
    permission = params[:permission]
    user = User.find_by_email_or_hashed_email params[:email]

    unless user && user.teacher?
      flash[:alert] = "FAILED: user #{params[:email]} could not be found or was not a teacher"
      redirect_to :permissions_form
      return
    end

    if permission == 'admin'
      user.update!(admin: true)
      flash[:alert] = "User #{user.id} granted admin status"
    else
      user.permission = permission
      flash[:alert] = "User #{user.id} granted #{permission} permission"
    end
    redirect_to :permissions_form
  end

  def revoke_all_permissions
    hashed_email = User.hash_email params[:email]
    # Though in theory a hashed email specifies a unique account, in practice it may not. As this is
    # security related, we therefore iterate rather than use find_by_hashed_email.
    User.with_deleted.where(hashed_email: hashed_email).each(&:revoke_all_permissions)
  end
end
