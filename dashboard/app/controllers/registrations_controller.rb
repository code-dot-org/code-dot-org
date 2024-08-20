require 'cdo/firehose'
require 'cdo/honeybadger'
require 'cdo/mailjet'
require 'cpa'
require_relative '../../../shared/middleware/helpers/experiments'
require 'metrics/events'
require 'policies/lti'
require 'queries/lti'

class RegistrationsController < Devise::RegistrationsController
  respond_to :json
  prepend_before_action :authenticate_scope!, only: [
    :edit, :update, :destroy, :upgrade, :set_email, :set_user_type,
    :migrate_to_multi_auth, :demigrate_from_multi_auth
  ]
  skip_before_action :verify_authenticity_token, only: [:set_student_information]
  skip_before_action :clear_sign_up_session_vars, only: [:new, :begin_sign_up, :cancel, :create]

  #
  # GET /users/sign_up
  #
  def new
    session[:user_return_to] ||= params[:user_return_to]
    if PartialRegistration.in_progress?(session)
      user_params = params[:user] || ActionController::Parameters.new
      user_params[:user_type] ||= session[:default_sign_up_user_type]
      user_params[:email] ||= params[:email]

      @user = User.new_with_session(user_params.permit(:user_type, :email), session)
    else
      save_default_sign_up_user_type
      SignUpTracking.begin_sign_up_tracking(session, split_test: true)
      super
    end
  end

  # If the user[user_type] queryparam is provided and valid, save its value
  # into the session so we can use it as a default on the finish_sign_up page.
  # If not, clear it from the session so we don't use a misleading default.
  def save_default_sign_up_user_type
    requested_user_type = params.dig(:user, :user_type)
    if User::USER_TYPE_OPTIONS.include? requested_user_type
      session[:default_sign_up_user_type] = requested_user_type
    else
      session.delete(:default_sign_up_user_type)
    end
  end

  #
  # POST /users/begin_sign_up
  #
  # Submit step 1 of the signup process for creating an email/password account.
  #
  def begin_sign_up
    @user = User.new(begin_sign_up_params)
    @user.validate_for_finish_sign_up
    SignUpTracking.log_begin_sign_up(@user, session)

    if @user.errors.blank?
      PartialRegistration.persist_attributes(session, @user)
    end

    render 'new'
  end

  #
  # Get /users/new_sign_up
  #
  def new_sign_up
    render 'new_sign_up'
  end

  # Part of the new sign up flow - work in progress
  def account_type
    view_options(full_width: true, responsive_content: true)
  end

  #
  # Get /users/finish_teacher_account
  #
  def finish_teacher_account
    # Get the request location
    location = Geocoder.search(request.ip).try(:first)
    country_code = location&.country_code.to_s.upcase
    @us_ip = ['US', 'RD'].include?(country_code)
    render 'finish_teacher_account'
  end

  #
  # GET /users/cancel
  #
  # Cancels the in-progress partial user registration and redirects to sign-up page.
  #
  def cancel
    provider = PartialRegistration.get_provider(session) || 'email'
    SignUpTracking.log_cancel_finish_sign_up(session, provider)
    SignUpTracking.end_sign_up_tracking(session)

    PartialRegistration.delete(session)
    redirect_to new_user_registration_path
  end

  #
  # PUT /users
  #
  def update
    return head(:bad_request) if params[:user].nil?
    # Use set_user_type instead
    return head(:bad_request) if params[:user][:user_type].present?
    # Use set_email instead
    return head(:bad_request) if params[:user][:email].present?
    return head(:bad_request) if params[:user][:hashed_email].present?

    successfully_updated =
      if forbidden_change?(current_user, params)
        false
      elsif needs_password?(current_user, params)
        current_user.update_with_password(update_params(params))
      else
        # remove the virtual current_password attribute update_without_password
        # doesn't know how to ignore it
        params[:user].delete(:current_password)
        current_user.update_without_password(update_params(params))
      end

    respond_to_account_update(successfully_updated)
  end

  #
  # POST /users
  #
  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do |retries, exception|
      if retries > 0
        Honeybadger.notify(
          error_class: 'User creation required multiple attempts',
          error_message: "retry ##{retries} failed with exception: #{exception}"
        )
      end
      super
    end

    if current_user && current_user.errors.blank?
      if current_user.teacher?
        begin
          MailJet.create_contact_and_add_to_welcome_series(current_user, request.locale)
        rescue => exception
          # If we can't add the user to the welcome series, we don't want to disrupt
          # sign up, but we do want to know about it.
          Honeybadger.notify(
            exception,
            error_message: 'Failed to add user to welcome series',
            context: {
              locale: request.locale,
            }
          )
        end
      end
      ParentMailer.parent_email_added_to_student_account(current_user.parent_email, current_user).deliver_now if current_user.parent_email.present?

      storage_id = take_storage_id_ownership_from_cookie(current_user.id)
      current_user.generate_progress_from_storage_id(storage_id) if storage_id
      PartialRegistration.delete session
      if Policies::Lti.lti? current_user
        lms_name = Queries::Lti.get_lms_name_from_user(current_user)
        metadata = {
          'user_type' => current_user.user_type,
          'lms_name' => lms_name,
          'context' => 'registration_controller'
        }
        Metrics::Events.log_event(
          user: current_user,
          event_name: 'lti_user_created',
          metadata: metadata,
        )
      end
      has_school = current_user.school_info&.school_id.present?
      event_metadata = {
        'has_school' => has_school,
      }
      Metrics::Events.log_event(
        user: current_user,
        event_name: 'Sign Up Finished Backend',
        metadata: event_metadata,
        get_enabled_experiments: true,
      )
    end

    SignUpTracking.log_sign_up_result resource, session
  end

  #
  # GET /users/to_destroy
  #
  # Returns array of users that will be destroyed if current_user is destroyed
  #
  def users_to_destroy
    return head :bad_request unless current_user&.can_delete_own_account?
    users = current_user.dependent_students << current_user.summarize
    render json: users
  end

  def destroy
    return head :bad_request unless current_user.can_delete_own_account?
    password_required = current_user.encrypted_password.present?
    invalid_password = !current_user.valid_password?(params[:password_confirmation])
    if password_required && invalid_password
      current_user.errors.add :current_password
      render json: {
        error: current_user.errors.as_json(full_messages: true)
      }, status: :bad_request
      return
    end
    dependent_students = current_user.dependent_students
    destroy_users(current_user, dependent_students)
    if current_user.teacher? && current_user.email.present?
      TeacherMailer.delete_teacher_email(current_user, dependent_students).deliver_now
    end
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    head :no_content
  end

  def parent_email_params
    params.
      require(:user).
      tap do |user|
        user[:parent_email_preference_email] = user[:parent_email]
        if user[:parent_email_preference_opt_in].empty?
          user[:parent_email_preference_opt_in_required] = '0'
          user[:parent_email_update_only] = '1'
        else
          user[:parent_email_update_only] = '0'
          user[:parent_email_preference_opt_in_required] = '1'
          user[:parent_email_preference_request_ip] = request.ip
        end
      end.
      permit(
        :parent_email_preference_email,
        :parent_email_preference_opt_in,
        :parent_email_preference_request_ip,
        :parent_email_preference_source,
        :parent_email_preference_opt_in_required,
        :parent_email_update_only
      )
  end

  def sign_up_params
    super.tap do |params|
      case params[:user_type]
      when 'teacher'
        params[:email_preference_opt_in_required] = true
        params[:email_preference_request_ip] = request.ip
        params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
        params[:email_preference_form_kind] = "0"
      when 'student'
        params[:parent_email_preference_request_ip] = request.ip
        params[:parent_email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
      end

      params[:data_transfer_agreement_accepted] = params[:data_transfer_agreement_accepted] == "1"
      if params[:data_transfer_agreement_required] && params[:data_transfer_agreement_accepted]
        params[:data_transfer_agreement_accepted] = true
        params[:data_transfer_agreement_request_ip] = request.ip
        params[:data_transfer_agreement_source] = User::ACCOUNT_SIGN_UP
        params[:data_transfer_agreement_kind] = "0"
        params[:data_transfer_agreement_at] = DateTime.now
      end
    end
  end

  def begin_sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  # Set age, us_state and gender for the current user if empty - skips CSRF verification because this can be called
  # from cached pages which will not populate the CSRF token. This also skips lockout policy
  # checks since those depend on the age being set.
  def set_student_information
    return head(:forbidden) unless current_user
    student_information = {}

    student_information[:age] = params[:user][:age] if current_user.age.blank?
    student_information[:us_state] = params[:user][:us_state] unless current_user.user_provided_us_state
    student_information[:user_provided_us_state] = params[:user][:us_state].present? unless current_user.user_provided_us_state
    student_information[:gender_student_input] = params[:user][:gender_student_input] if current_user.gender.blank?
    student_information[:country_code] = params[:user][:country_code] if current_user.country_code.blank?

    current_user.update(student_information) unless student_information.empty?
  end

  def upgrade
    return head(:bad_request) unless params[:user].present? && current_user&.can_create_personal_login?
    user_params = params[:user]
    # User model normalizes and hashes email _after_ validation **rage**
    user_params[:hashed_email] = User.hash_email(user_params[:email]) if user_params[:email].present?
    current_user.reload # Needed to make tests pass for reasons noted in registrations_controller_test.rb

    successfully_updated = current_user.upgrade_to_personal_login(upgrade_params)
    has_email = current_user.parent_email.blank? && current_user.hashed_email.present?
    success_message_kind = has_email ? :personal_login_created_email : :personal_login_created_username

    if successfully_updated && current_user.parent_email.present?
      ParentMailer.student_associated_with_parent_email(current_user.parent_email, current_user).deliver_now
    end

    current_user.reload unless successfully_updated # if update fails, roll back user model so error page renders correctly
    respond_to_account_update(successfully_updated, success_message_kind)
  end

  #
  # PATCH /users/email
  #
  # Route allowing user to update their primary email address.
  #
  def set_email
    return head(:bad_request) if params[:user].nil?
    successfully_updated = update_user_email

    if successfully_updated
      head :no_content
    else
      render status: :unprocessable_entity,
             json: current_user.errors.as_json(full_messages: true),
             content_type: 'application/json'
    end
  end

  #
  # PATCH /users/parent_email
  #
  # Route allowing user to update the parent email address associated
  # with the account
  #
  def set_parent_email
    return head(:bad_request) if params[:user].nil?

    successfully_updated = current_user.update_without_password(parent_email_params)

    if successfully_updated
      ParentMailer.parent_email_added_to_student_account(current_user.parent_email, current_user).deliver_now
      head :no_content
    else
      render status: :unprocessable_entity,
             json: current_user.errors.as_json(full_messages: true),
             content_type: 'application/json'
    end
  end

  #
  # PATCH /users/user_type
  #
  # Route allowing user to change from a student to a teacher, or from a
  # teacher to a student.
  #
  def set_user_type
    return head(:bad_request) if params[:user].nil?
    return head(:bad_request) if params[:user][:user_type].nil?

    successfully_updated =
      if current_user.migrated?
        if forbidden_change?(current_user, params)
          false
        else
          current_user.set_user_type(
            set_user_type_params[:user_type],
            set_user_type_params[:email],
            email_preference_params(EmailPreference::ACCOUNT_TYPE_CHANGE, "0")
          )
        end
      else
        if forbidden_change?(current_user, params)
          false
        elsif needs_password?(current_user, params)
          # Guaranteed to fail, but sets appropriate user errors for response
          current_user.update_with_password(set_user_type_params)
        else
          current_user.update_without_password(set_user_type_params)
        end
      end

    if successfully_updated
      head :no_content
    else
      render status: :unprocessable_entity,
             json: current_user.errors.as_json(full_messages: true),
             content_type: 'application/json'
    end
  end

  #
  # GET /users/migrate_to_multi_auth
  #
  def migrate_to_multi_auth
    current_user.migrate_to_multi_auth
    redirect_to edit_registration_path(current_user),
      notice: I18n.t('auth.migration_success')
  end

  #
  # GET /users/demigrate_from_multi_auth
  #
  def demigrate_from_multi_auth
    current_user.demigrate_from_multi_auth
    redirect_to edit_registration_path(current_user),
      notice: I18n.t('auth.demigration_success')
  end

  def existing_account
    params.require([:email, :provider])
    render 'existing_account'
  end

  #
  # GET /users/edit
  #
  def edit
    @permission_status = current_user.cap_status

    # Get the request location
    location = Geocoder.search(request.ip).try(:first)
    @country_code = location&.country_code.to_s.upcase
    @is_usa = ['US', 'RD'].include?(@country_code)

    # We determine if the student is potentially locked by looking at their age
    # If they are older (or there is no policy for them) they are unlocked
    # This ignores them being explicitly unlocked by parental permission so we
    # can show the 'Granted' status of that permission later.
    @potentially_locked = Policies::ChildAccount.underage?(current_user)

    # The student is in a 'lockout' flow if they are potentially locked out and not unlocked
    @student_in_lockout_flow = @potentially_locked && !Policies::ChildAccount::ComplianceState.permission_granted?(current_user)
    # We need to also account for the case when the US State is not specified
    # All students are locked out of account settings features until they specify these
    @locked = @student_in_lockout_flow || current_user.country_code.nil? || current_user.us_state.nil?
    # Only for students
    @locked &&= current_user.student?
    # Only for US-based requests
    @locked &&= @is_usa
    # Put this behind an experiment flag for now
    @locked &&= !!experiment_value('cpa-partial-lockout', request)

    @personal_account_linking_enabled = !@locked

    # Handle users who aren't locked out, but still need parent permission to link personal accounts.
    if @potentially_locked
      permission_request = current_user.latest_parental_permission_request
      @pending_email = permission_request&.parent_email
      @request_date = permission_request&.updated_at || Date.new

      partially_locked = Policies::ChildAccount.partially_locked_out?(current_user) && experiment_value('cpa-partial-lockout', request)
      @personal_account_linking_enabled = false if partially_locked
    end
  end

  private def update_user_email
    return false if forbidden_change?(current_user, params)

    if current_user.migrated?
      if needs_password?(current_user, params) && !current_user.valid_password?(params[:user][:current_password])
        current_user.errors.add :current_password
        return false
      end
      current_user.update_primary_contact_info(new_email: set_email_params.delete(:email), new_hashed_email: set_email_params.delete(:hashed_email))
    end

    if needs_password?(current_user, params)
      current_user.update_with_password(set_email_params)
    else
      params[:user].delete(:current_password)
      current_user.update_without_password(set_email_params)
    end
  end

  private def respond_to_account_update(successfully_updated, flash_message_kind = :updated)
    user = current_user
    respond_to do |format|
      if successfully_updated
        set_locale_cookie(user.locale)
        # Sign in the user bypassing validation in case his password changed
        bypass_sign_in user

        format.html do
          set_flash_message :notice, flash_message_kind, {username: user.username}
          begin
            redirect_back fallback_location: edit_registration_path(current_user)
          rescue ActionController::RedirectBackError
            redirect_to edit_registration_path(user)
          end
        end
        format.any {head :no_content}
      else
        format.html {render "edit", formats: [:html]}
        format.any do
          render status: :unprocessable_entity,
                 json: user.errors.as_json(full_messages: true),
                 content_type: 'application/json'
        end
      end
    end
  end

  # Reject certain changes for certain users outright
  private def forbidden_change?(user, params)
    return true if params[:user][:password].present? && !user.can_edit_password?
    return true if params[:user][:email].present? && !user.can_edit_email?
    return true if params[:user][:hashed_email].present? && !user.can_edit_email?
    false
  end

  # check if we need password to update user data
  # ie if password or email was changed
  # extend this as needed
  private def needs_password?(user, params)
    return false if user.migrated? && user.encrypted_password.blank? && params[:user][:password].blank?

    email_is_changing = params[:user][:email].present? &&
      user.email != params[:user][:email]
    hashed_email_is_changing = params[:user][:hashed_email].present? &&
      user.hashed_email != params[:user][:hashed_email]
    parent_email_is_changing = params[:user][:parent_email].present? &&
      user.parent_email != params[:user][:parent_email]
    new_email_matches_hashed_email = email_is_changing &&
      User.hash_email(params[:user][:email]) == user.hashed_email
    (email_is_changing && !new_email_matches_hashed_email) ||
      hashed_email_is_changing ||
      parent_email_is_changing ||
      params[:user][:password].present?
  end

  # Accept only whitelisted params for update and upgrade.
  private def upgrade_params
    params.require(:user).permit(
      :username,
      :parent_email,
      :email,
      :hashed_email,
      :password,
      :password_confirmation,
      :secret_words,
    )
  end

  private def update_params(params)
    params.require(:user).permit(
      :parent_email,
      :username,
      :password,
      :encrypted_password,
      :current_password,
      :password_confirmation,
      :gender,
      :gender_student_input,
      :name,
      :locale,
      :age,
      :birthday,
      :school,
      :full_address,
      :terms_of_service_version,
      :provider,
      :us_state,
      :country_code,
      :user_provided_us_state,
      :ai_rubrics_disabled,
      :lti_roster_sync_enabled,
      school_info_attributes: [
        :country,
        :school_type,
        :state, :school_state,
        :zip, :school_zip,
        :school_district_id,
        :school_district_other,
        :school_district_name,
        :school_id,
        :school_other,
        :school_name,
        :full_address,
      ],
      races: [],
    )
  end

  private def set_email_params
    params.
      require(:user).
      permit(:email, :hashed_email, :current_password).
      merge(email_preference_params(EmailPreference::ACCOUNT_EMAIL_CHANGE, "0"))
  end

  private def set_user_type_params
    params.
      require(:user).
      permit(:user_type, :email, :hashed_email).
      merge(email_preference_params(EmailPreference::ACCOUNT_TYPE_CHANGE, "0"))
  end

  private def email_preference_params(source, form_kind)
    params.
      require(:user).
      tap do |user|
        if user[:email_preference_opt_in].present?
          user[:email_preference_request_ip] = request.ip
          user[:email_preference_source] = source
          user[:email_preference_form_kind] = form_kind
        end
      end.
      permit(
        :email_preference_opt_in,
        :email_preference_request_ip,
        :email_preference_source,
        :email_preference_form_kind,
      )
  end

  private def log_account_deletion_to_firehose(current_user, dependent_users)
    # Log event for user initiating account deletion.
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'user-soft-delete-audit-v2',
        event: 'initiated-account-deletion',
        user_id: current_user.id,
        data_json: {
          user_type: current_user.user_type,
          dependent_user_ids: dependent_users.pluck(:id),
        }.to_json
      }
    )

    # Log separate events for dependent users destroyed in user-initiated account deletion.
    # This should only happen for teachers.
    dependent_users.each do |user|
      FirehoseClient.instance.put_record(
        :analysis,
        {
          study: 'user-soft-delete-audit-v2',
          event: 'dependent-account-deletion',
          user_id: user[:id],
          data_json: {
            user_type: user[:user_type],
            deleted_by_id: current_user.id,
          }.to_json
        }
      )
    end
  end

  private def destroy_users(current_user, dependent_users)
    users = [current_user] + dependent_users
    user_ids_to_destroy = users.pluck(:id)
    User.ignore_deleted_at_index.destroy(user_ids_to_destroy)

    log_account_deletion_to_firehose(current_user, dependent_users)
  end
end
