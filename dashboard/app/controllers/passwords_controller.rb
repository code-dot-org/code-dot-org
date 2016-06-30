class PasswordsController < Devise::PasswordsController
  skip_before_filter :require_no_authentication
  prepend_before_filter :require_no_or_admin_authentication

  append_after_filter :show_reset_url_if_admin, only: :create

  protected

  def after_sending_reset_password_instructions_path_for(resource_name)
    if current_user.try(:admin)
      new_user_password_path
    else
      new_session_path(resource_name) if is_navigational_format?
    end
  end

  private

  def show_reset_url_if_admin
    return unless current_user.try(:admin?)
    if raw_token = resource.try(:raw_token)
      url = edit_password_url(resource, :reset_password_token => raw_token)
      flash[:notice] = "Reset password link sent to user. You may also send this link directly: <a href='#{url}'>#{url}</a>".html_safe
    end
  end

  def require_no_or_admin_authentication
    return if current_user.try(:admin?) # allow admins
    require_no_authentication
  end
end
