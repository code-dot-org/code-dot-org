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
    primary_contact_info_id
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
    user_id = params[:user_id]
    user_id.strip!
    user = User.from_identifier(user_id)

    if user
      bypass_sign_in user
      # Set cookie to indicate assumed identity
      session[:assumed_identity] = true
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
        Unit.find_by_id(params[:script_id_or_name])
      else
        Unit.find_by_name(params[:script_id_or_name])
      end
    unless script
      flash[:alert] = "Unit (ID or Name: #{params[:script_id_or_name]}) not found"
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

  # GET /admin/user_progress
  def user_progress_form
    script_offset = params[:script_offset] || 0 # Not currently exposed in admin UI but can be manually added to URL

    set_target_user_from_identifier(params[:user_identifier])

    if @target_user
      @user_scripts = UserScript.
                      where(user_id: @target_user.id).
                      order(updated_at: :desc).
                      limit(100).
                      offset(script_offset)
    end
  end

  # GET /admin/user_projects
  # This page takes an optional user_identifier param and renders a page with the users active and deleted projects
  def user_projects_form
    set_target_user_from_identifier(params[:user_identifier])

    if @target_user
      @projects_list = ProjectsList.fetch_personal_projects_for_admin(@target_user.id, 'active')
      @deleted_projects_list = ProjectsList.fetch_personal_projects_for_admin(@target_user.id, 'deleted')
    end
  end

  # PUT /admin/user_project
  # This page takes a user_id and channel param and un-deletes the project and then refreshes the user_projects_form
  def user_project_restore_form
    user_id = params[:user_id]
    channel = params[:channel]

    if channel.present? && user_id.present?
      Projects.new(storage_id_for_user_id(user_id)).restore(channel)
    end

    redirect_to action: "user_projects_form", user_identifier: user_id
  end

  # GET /admin/delete_progress
  # This page is linked from /admin/user_progress to confirm that the admin
  # wants to delete progress and to capture additional information. It expects
  # user_id and script_id to be passed in as parameters.
  def delete_progress_form
    params.require([:user_id, :script_id])

    @target_user = User.find(params[:user_id])
    @script = Unit.get_from_cache(params[:script_id])
    @user_level_count = UserLevel.
                        where(user_id: @target_user.id, script_id: @script.id).
                        count
  end

  def delete_progress
    params.require([:user_id, :script_id, :reason])

    user_id = params[:user_id]
    script_id = params[:script_id]
    user_storage_id = storage_id_for_user_id(user_id)

    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'reset-progress',
        event: 'admin-delete-progress',
        user_id: user_id,
        script_id: script_id,
        data_json: {
          signed_in_user: current_user.username,
          reason: params[:reason]
        }.to_json
      }
    )

    UserScript.where(user_id: user_id, script_id: script_id).destroy_all
    UserLevel.where(user_id: user_id, script_id: script_id).destroy_all
    ChannelToken.where(storage_id: user_storage_id, script_id: script_id).destroy_all unless user_storage_id.nil?
    TeacherFeedback.where(student_id: user_id, script_id: script_id).destroy_all
    CodeReview.where(user_id: user_id, script_id: script_id).destroy_all

    redirect_to user_progress_form_path({user_identifier: user_id}), notice: "Progress deleted."
  end

  # get /admin/permissions
  def permissions_form
    search_term = params[:search_term]
    permission = params[:permission]
    if search_term.present?
      if /^\d+$/.match?(search_term)
        @user = restricted_users.find_by(id: search_term)
      else
        users = restricted_users.where(hashed_email: User.hash_email(search_term)).or(restricted_users.where(username: search_term))
        @user = users.first
        if users.many?
          flash[:notice] = "More than one User matches email address.  " \
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
  rescue ArgumentError => exception
    flash[:alert] = "MERGE FAILED: #{exception.message}"
    redirect_to studio_person_form_path
  end

  # POST /admin/studio_person_split
  def studio_person_split
    studio_person = StudioPerson.find_by_id params[:studio_person_id]

    StudioPerson.split studio_person

    flash[:alert] = "SPLIT: #{params[:studio_person_id]}"
    redirect_to studio_person_form_path
  rescue ArgumentError => exception
    flash[:alert] = "SPLIT FAILED: #{exception.message}"
    redirect_to studio_person_form_path
  end

  # POST /admin/studio_person_add_email_to_emails
  def studio_person_add_email_to_emails
    studio_person = StudioPerson.find_by_id params[:studio_person_id]

    studio_person.add_email_to_emails params[:email]

    flash[:alert] = "ADDED: #{params[:email]} to #{params[:studio_person_id]}"
    redirect_to studio_person_form_path
  rescue ArgumentError => exception
    flash[:alert] = "ADD EMAIL FAILED: #{exception.message}"
    redirect_to studio_person_form_path
  end

  private def restricted_users
    User.select(RESTRICTED_USER_ATTRIBUTES_FOR_VIEW)
  end

  private def page
    params[:page] || 1
  end

  private def page_size
    return DEFAULT_MANAGE_PAGE_SIZE unless params.key? :page_size
    params[:page_size] == 'All' ? @users_with_permission.count : params[:page_size]
  end

  private def set_target_user_from_identifier(user_identifier)
    if user_identifier
      user_identifier.strip!
      @target_user = User.from_identifier(user_identifier)
      flash[:alert] = 'User not found' unless @target_user
    end
  end
end
