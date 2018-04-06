require 'cdo/activity_constants'

class AdminUsersController < ApplicationController
  include Pd::PageHelper
  before_action :authenticate_user!
  before_action :require_admin

  DEFAULT_MANAGE_PAGE_SIZE = 25
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

  def account_repair_form
  end

  def account_repair
    return unless params[:email]
    hashed_email = User.hash_email(params[:email])
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
    user = User.from_identifier(params[:user_id])

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
      user.undestroy
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
    script =
      if params[:script_id_or_name].to_i.to_s == params[:script_id_or_name]
        Script.find_by_id(params[:script_id_or_name])
      else
        Script.find_by_name(params[:script_id_or_name])
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

  # get /admin/permissions
  def permissions_form
    search_term = params[:search_term]
    permission = params[:permission]
    if search_term.present?
      if search_term =~ /^\d+$/
        @user = restricted_users.find_by(id: search_term)
      else
        users = restricted_users.where(hashed_email: User.hash_email(search_term))
        @user = users.first
        if users.many?
          flash[:notice] = "More than one User matches email address.  "\
                         "Showing first result.  Matching User IDs - #{users.pluck(:id).join ','}"
        end
      end
      unless @user || search_term.blank?
        flash[:notice] = "User Not Found"
      end
    elsif permission.present?
      @users_with_permission = restricted_users.
                                 joins(:permissions).
                                 where(user_permissions: {permission: permission}).
                                 order(:email)
      @users_with_permission = @users_with_permission.page(page).per(page_size)
    end
  end

  def grant_permission
    user_id = params[:user_id]
    @user = restricted_users.find_by(id: user_id)
    unless @user.try(:teacher?)
      flash[:alert] = "FAILED: user #{user_id} could not be found or is not a teacher"
      redirect_to action: "permissions_form", search_term: user_id
      return
    end
    @user.permission = params[:permission]
    redirect_to permissions_form_path(search_term: user_id)
  end

  def revoke_permission
    user_id = params[:user_id]
    @user = restricted_users.find_by(id: user_id)
    permission = params[:permission]
    @user.try(:delete_permission, permission)
    redirect_to permissions_form_path(search_term: user_id)
  end

  def bulk_grant_permission
    permission = params[:bulk_permission]
    emails = params[:emails]
    if permission.present? && emails.present?
      failed_emails = []
      succeeded_emails = []
      emails.split.each do |email|
        user = restricted_users.find_by(email: email)
        unless user.try(:teacher?)
          failed_emails.push(email)
          next
        end
        user.permission = permission
        succeeded_emails.push(email)
      end
      unless succeeded_emails.empty?
        flash[:notice] = "#{permission.titleize} Permission added for #{succeeded_emails.length} User#{succeeded_emails.length == 1 ? '' : 's'}"
      end
      unless failed_emails.empty?
        flash[:alert] = "FAILED: These Users could not be found or are not teachers: #{failed_emails.join(', ')}"
      end
      redirect_to permissions_form_path
    end
  end

  # GET /admin/studio_person
  def studio_person_form
  end

  # POST /admin/studio_person_merge
  def studio_person_merge
    studio_person_a = StudioPerson.find_by_id params[:studio_person_a_id]
    studio_person_b = StudioPerson.find_by_id params[:studio_person_b_id]

    StudioPerson.merge studio_person_a, studio_person_b

    flash[:alert] = "MERGED: #{params[:studio_person_a_id]} and #{params[:studio_person_b_id]}"
    redirect_to studio_person_form_path
  rescue ArgumentError => e
    flash[:alert] = "MERGE FAILED: #{e.message}"
    redirect_to studio_person_form_path
  end

  # POST /admin/studio_person_split
  def studio_person_split
    studio_person = StudioPerson.find_by_id params[:studio_person_id]

    StudioPerson.split studio_person

    flash[:alert] = "SPLIT: #{params[:studio_person_id]}"
    redirect_to studio_person_form_path
  rescue ArgumentError => e
    flash[:alert] = "SPLIT FAILED: #{e.message}"
    redirect_to studio_person_form_path
  end

  # POST /admin/studio_person_add_email_to_emails
  def studio_person_add_email_to_emails
    studio_person = StudioPerson.find_by_id params[:studio_person_id]

    studio_person.add_email_to_emails params[:email]

    flash[:alert] = "ADDED: #{params[:email]} to #{params[:studio_person_id]}"
    redirect_to studio_person_form_path
  rescue ArgumentError => e
    flash[:alert] = "ADD EMAIL FAILED: #{e.message}"
    redirect_to studio_person_form_path
  end

  private

  def restricted_users
    User.select(RESTRICTED_USER_ATTRIBUTES_FOR_VIEW)
  end

  def page
    params[:page] || 1
  end

  def page_size
    return DEFAULT_MANAGE_PAGE_SIZE unless params.key? :page_size
    params[:page_size] == 'All' ? @users_with_permission.count : params[:page_size]
  end
end
