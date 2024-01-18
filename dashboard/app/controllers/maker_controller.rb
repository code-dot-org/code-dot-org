class MakerController < ApplicationController
  # Maker Toolkit is currently used in standalone Create Devices with Apps unit.
  # Retrieves the relevant Create Devices with Apps unit version based on self.maker_script.
  def home
    # Redirect to login if not signed in
    authenticate_user!

    maker_unit_for_user = MakerController.maker_script current_user
    current_level = current_user.next_unpassed_progression_level(maker_unit_for_user)
    @maker_unit = {
      assignableName: data_t_suffix('script.name', maker_unit_for_user[:name], 'title'),
      lessonName: current_level.lesson.localized_title,
      linkToOverview: script_path(maker_unit_for_user),
      linkToLesson: script_next_path(maker_unit_for_user, 'next')
    }
  end

  # Returns which devices script version to show:
  #   Assigned script should take precedence - show most recent version that's been assigned.
  #   Otherwise, show the most recent version with progress.
  #   If none of the above applies, default to most recent.
  def self.maker_script(for_user)
    Unit.latest_assigned_version('devices', for_user) ||
      Unit.latest_version_with_progress('devices', for_user) ||
      Unit.latest_stable_version('devices')
  end

  def setup
  end

  # GET /maker/login_code
  # renders a page for users to enter a login key
  def login_code
  end

  # GET /maker/display_code
  # renders a page for users to copy and paste a login key
  def display_code
    # Generate encrypted code to display to user
    user_auth = current_user&.find_credential(AuthenticationOption::GOOGLE)
    if user_auth.nil?
      @secret_code = nil
      return
    end

    secret_str = Time.now.strftime('%Y%m%dT%H%M%S%z') + user_auth[:authentication_id] + user_auth[:credential_type]
    @secret_code = Encryption.encrypt_string_utf8(secret_str)
  end

  # GET /maker/confirm_login
  # Renders a page to confirm uses want to login via Google OAuth
  # This route is need to convert the GET request from the Maker App into
  # a POST that can be used to login via Google OAuth
  def confirm_login
    return_to = params[:user_return_to]
    session[:user_return_to] = return_to if return_to.present?
  end
end
