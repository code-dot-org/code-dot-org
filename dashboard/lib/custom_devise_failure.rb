# Overrides the locale for Devise failures to use the same logic as our app.
class CustomDeviseFailure < Devise::FailureApp
  include ActionController::Helpers
  include ActionController::Cookies
  include LocaleHelper

  protected

  def i18n_options(options)
    options[:locale] = locale
    options
  end

end
