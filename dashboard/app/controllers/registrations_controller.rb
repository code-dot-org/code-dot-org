class RegistrationsController < Devise::RegistrationsController
  respond_to :json
  prepend_before_action :authenticate_scope!, only: [
    :edit, :update, :destroy, :upgrade, :set_email, :set_user_type
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
    current_user.update(age: params[:user][:age]) unless current_user.age.present?
  end

  def upgrade
    return head(:bad_request) if params[:user].nil?
    params_to_pass = params.deep_dup
    # Set provider to nil to mark the account as self-managed
    user_params = params_to_pass[:user].merge!({provider: nil})
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

    successfully_updated = can_update && current_user.update(update_params(params_to_pass))
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
      if forbidden_change?(current_user, params)
        false
      elsif needs_password?(current_user, params)
        current_user.update_with_password(set_email_params)
      else
        params[:user].delete(:current_password)
        current_user.update_without_password(set_email_params)
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
      if forbidden_change?(current_user, params)
        false
      elsif needs_password?(current_user, params)
        # Guaranteed to fail, but sets appropriate user errors for response
        current_user.update_with_password(set_user_type_params)
      else
        current_user.update_without_password(set_user_type_params)
      end

    if successfully_updated
      head :no_content
    else
      render status: :unprocessable_entity,
             json: current_user.errors.as_json(full_messages: true),
             content_type: 'application/json'
    end
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
    email_is_changing = params[:user][:email].present? &&
      user.email != params[:user][:email]
    hashed_email_is_changing = params[:user][:hashed_email].present? &&
      user.hashed_email != params[:user][:hashed_email]
    new_email_matches_hashed_email = email_is_changing &&
      User.hash_email(params[:user][:email]) == user.hashed_email
    (email_is_changing && !new_email_matches_hashed_email) ||
      hashed_email_is_changing ||
      params[:user][:password].present?
  end

  # Accept only whitelisted params for update.
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
end
