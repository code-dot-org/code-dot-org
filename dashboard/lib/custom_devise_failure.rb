# Overrides the locale for Devise failures to use the same logic as our app.
class CustomDeviseFailure < Devise::FailureApp
  include ActionController::Helpers
  include ActionController::Cookies
  include LocaleHelper

  def hashed_email_in_hoc_signups?(hashed_email)
    hoc_year = DCDO.get("hoc_year", 2017)
    PEGASUS_DB[:forms].where(hashed_email: hashed_email, kind: "HocSignup#{hoc_year}").any?
  end

  def respond
    user_param = request.parameters['user']
    if user_param && user_param['hashed_email']
      hashed_email = user_param['hashed_email']
      if failed_login? && hashed_email_in_hoc_signups?(hashed_email)
        # If the user has a full account as well, don't use the HOC flow
        user = User.find_by(hashed_email: hashed_email)
        unless user
          redirect_to "#{new_user_registration_path}?already_hoc_registered=true"
          return
        end
      end
    end
    super
  end

  def failed_login?
    options = request.env["warden.options"]
    options && options[:action] == "unauthenticated"
  end

  protected

  def i18n_options(options)
    options[:locale] = locale
    options
  end
end
