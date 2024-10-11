class PasswordsController < Devise::PasswordsController
  skip_before_action :require_no_authentication
  prepend_before_action :require_no_or_admin_authentication

  append_after_action :show_reset_url_if_admin, only: :create

  def create
    unless verify_recaptcha || current_user&.admin?
      flash[:alert] = I18n.t('password.reset_errors.captcha_required')
      redirect_to new_user_password_path
      return
    end
    super
  end

  protected def after_sending_reset_password_instructions_path_for(resource_name)
    if current_user.try(:admin)
      new_user_password_path
    else
      flash[:notice] = "If we find your email address in our system, you will receive a password recovery link in a few minutes."
      new_session_path(resource_name) if is_navigational_format?
    end
  end

  private def show_reset_url_if_admin
    return unless current_user.try(:admin?)
    if raw_token = resource.try(:raw_token)
      url = edit_password_url(resource, reset_password_token: raw_token)
      # We can safely treat this string as HTML-safe because we can trust
      # Devise's edit_password_url method not to inject HTML
      # rubocop:disable Rails/OutputSafety
      flash[:notice] = "Reset password link sent to user. You may also send this link directly: <a href='#{url}'>#{url}</a>".html_safe
      # rubocop:enable Rails/OutputSafety
    else
      flash[:notice] = "User does not have an email authentication option or does not exist."
    end
  end

  private def require_no_or_admin_authentication
    return if current_user.try(:admin?) # allow admins
    require_no_authentication
  end
end
