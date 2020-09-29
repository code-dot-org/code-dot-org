class PasswordsController < Devise::PasswordsController
  skip_before_action :require_no_authentication
  prepend_before_action :require_no_or_admin_authentication

  append_after_action :show_reset_url_if_admin, only: :create

  def create
    email = request.parameters['user']['email']
    if email_in_hoc_signups?(email)
      # If the user has a full account as well, don't use the HOC flow
      user = User.find_by_email_or_hashed_email(email)
      unless user
        redirect_to "#{new_user_registration_path}?already_hoc_registered=true"
        return
      end
    end
    unless verify_recaptcha || (current_user && current_user.admin?)
      flash[:alert] = I18n.t('password.reset_errors.captcha_required')
      redirect_to new_user_password_path
      return
    end
    super
  end

  protected

  def after_sending_reset_password_instructions_path_for(resource_name)
    if current_user.try(:admin)
      new_user_password_path
    else
      new_session_path(resource_name) if is_navigational_format?
    end
  end

  private

  def email_in_hoc_signups?(email)
    hoc_year = DCDO.get("hoc_year", 2017)
    normalized_email = email.strip.downcase
    PEGASUS_DB[:forms].where(email: normalized_email, kind: "HocSignup#{hoc_year}").any?
  end

  def show_reset_url_if_admin
    return unless current_user.try(:admin?)
    if raw_token = resource.try(:raw_token)
      url = edit_password_url(resource, reset_password_token: raw_token)
      flash[:notice] = "Reset password link sent to user. You may also send this link directly: <a href='#{url}'>#{url}</a>".html_safe
    elsif resource.child_users
      notice = "Reset password link sent to user. You may also send the link directly:<br>"
      resource.child_users.each do |user|
        url = edit_password_url(user, reset_password_token: user.raw_token)
        notice += "#{ActionController::Base.helpers.sanitize(user.username)}: <a href='#{url}'>#{url}</a><br>"
      end
      flash[:notice] = notice.html_safe
    end
  end

  def require_no_or_admin_authentication
    return if current_user.try(:admin?) # allow admins
    require_no_authentication
  end
end
