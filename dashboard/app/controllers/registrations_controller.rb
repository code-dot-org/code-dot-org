class RegistrationsController < Devise::RegistrationsController
  respond_to :json
  prepend_before_action :authenticate_scope!, only: [
    :edit, :update, :destroy, :upgrade, :set_email, :set_user_type,
    :migrate_to_multi_auth, :demigrate_from_multi_auth
  ]
  skip_before_action :verify_authenticity_token, only: [:set_age]

  def new
    session[:user_return_to] ||= params[:user_return_to]
    @already_hoc_registered = params[:already_hoc_registered]
    super
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

  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      super
    end

    should_send_new_teacher_email = current_user && current_user.teacher?
    TeacherMailer.new_teacher_email(current_user).deliver_now if should_send_new_teacher_email
    if current_user
      storage_id = take_storage_id_ownership_from_cookie(current_user.id)
      current_user.generate_progress_from_storage_id(storage_id) if storage_id
    end
  end

  #
  # GET /users/to_destroy
  #
  # Returns array of users that will be destroyed if current_user is destroyed
  #
  def users_to_destroy
    return head :bad_request unless current_user&.can_delete_own_account?
    render json: get_users_to_destroy(current_user)
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
    TeacherMailer.delete_teacher_email(current_user).deliver_now if current_user.teacher?
    destroy_dependent_users(current_user)
    Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name)
    return head :no_content
  end

  def sign_up_params
    super.tap do |params|
      if params[:user_type] == "teacher"
        params[:email_preference_opt_in_required] = true
        params[:email_preference_request_ip] = request.ip
        params[:email_preference_source] = EmailPreference::ACCOUNT_SIGN_UP
        params[:email_preference_form_kind] = "0"
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

  # Set age for the current user if empty - skips CSRF verification because this can be called
  # from cached pages which will not populate the CSRF token
  def set_age
    return head(:forbidden) unless current_user
    current_user.update(age: params[:user][:age]) unless current_user.age.present?
  end

  def upgrade
    return head(:bad_request) if params[:user].nil?
    params_to_pass = params.deep_dup
    # Set provider to nil to mark the account as self-managed
    user_params = params_to_pass[:user].merge!({provider: nil})
    # User model normalizes and hashes email _after_ validation **rage**
    user_params[:hashed_email] = User.hash_email(user_params[:email]) if user_params[:email].present?
    current_user.reload # Needed to make tests pass for reasons noted in registrations_controller_test.rb

    can_update =
      if current_user.teacher_managed_account?
        if current_user.secret_word_account?
          secret_words_match = user_params[:secret_words] == current_user.secret_words
          unless secret_words_match
            error_string = user_params[:secret_words].blank? ? :blank_plural : :invalid_plural
            current_user.errors.add(:secret_words, error_string)
          end
          secret_words_match
        else
          true
        end
      else
        false
      end

    successfully_updated = can_update && current_user.update(upgrade_params(params_to_pass))
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

    successfully_updated =
      if current_user.migrated?
        if forbidden_change?(current_user, params)
          false
        elsif needs_password?(current_user, params)
          if current_user.valid_password?(params[:user][:current_password])
            current_user.update_primary_contact_info(user: set_email_params)
          else
            current_user.errors.add :current_password
            false
          end
        else
          current_user.update_primary_contact_info(user: set_email_params)
        end
      else
        if forbidden_change?(current_user, params)
          false
        elsif needs_password?(current_user, params)
          current_user.update_with_password(set_email_params)
        else
          params[:user].delete(:current_password)
          current_user.update_without_password(set_email_params)
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
    was_migrated = current_user.migrated?
    current_user.migrate_to_multi_auth
    redirect_to after_update_path_for(current_user),
      notice: "Multi-auth is #{was_migrated ? 'still' : 'now'} enabled on your account."
  end

  #
  # GET /users/demigrate_from_multi_auth
  #
  def demigrate_from_multi_auth
    was_migrated = current_user.migrated?
    current_user.demigrate_from_multi_auth
    redirect_to after_update_path_for(current_user),
      notice: "Multi-auth is #{was_migrated ? 'now' : 'still'} disabled on your account."
  end

  private

  def respond_to_account_update(successfully_updated, flash_message_kind = :updated)
    user = current_user
    respond_to do |format|
      if successfully_updated
        set_locale_cookie(user.locale)
        # Sign in the user bypassing validation in case his password changed
        bypass_sign_in user

        format.html do
          set_flash_message :notice, flash_message_kind, {username: user.username}
          begin
            redirect_back fallback_location: after_update_path_for(user)
          rescue ActionController::RedirectBackError
            redirect_to after_update_path_for(user)
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
  def forbidden_change?(user, params)
    return true if params[:user][:password].present? && !user.can_edit_password?
    return true if params[:user][:email].present? && !user.can_edit_email?
    return true if params[:user][:hashed_email].present? && !user.can_edit_email?
    false
  end

  # check if we need password to update user data
  # ie if password or email was changed
  # extend this as needed
  def needs_password?(user, params)
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
  def upgrade_params(params)
    params.require(:user).permit(
      :username,
      :parent_email,
      :email,
      :hashed_email,
      :password,
      :password_confirmation,
      :provider
    )
  end

  def update_params(params)
    params.require(:user).permit(
      :parent_email,
      :username,
      :password,
      :encrypted_password,
      :current_password,
      :password_confirmation,
      :gender,
      :name,
      :locale,
      :age,
      :birthday,
      :school,
      :full_address,
      :terms_of_service_version,
      :provider,
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
        :full_address
      ],
      races: []
    )
  end

  def set_email_params
    params.
      require(:user).
      permit(:email, :hashed_email, :current_password).
      merge(email_preference_params(EmailPreference::ACCOUNT_EMAIL_CHANGE, "0"))
  end

  def set_user_type_params
    params.
      require(:user).
      permit(:user_type, :email, :hashed_email).
      merge(email_preference_params(EmailPreference::ACCOUNT_TYPE_CHANGE, "0"))
  end

  def email_preference_params(source, form_kind)
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

  def get_users_to_destroy(user)
    users = []
    if user.teacher?
      user.students.uniq.each do |student|
        if student.depends_on_teacher_for_login?
          users << {id: student.id, name: student.name}
        end
      end
    end
    users << {id: user.id, name: user.name}
    users
  end

  def destroy_dependent_users(user)
    user_ids_to_destroy = get_users_to_destroy(user).pluck(:id)
    User.destroy(user_ids_to_destroy)
  end
end
