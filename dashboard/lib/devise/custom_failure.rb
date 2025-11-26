# Overrides the locale for Devise failures to use the same logic as our app.
module Devise
  class CustomFailure < Devise::FailureApp
    protected def i18n_options(options)
      options[:locale] = locale
      options
    end
  end
end

Rails.application.config.to_prepare do
  Devise::CustomFailure.include LocaleHelper
end
