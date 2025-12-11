# Overrides the locale for Devise failures to use the same logic as our app.
module Devise
  class CustomFailure < Devise::FailureApp
    protected def i18n_options(options)
      options[:locale] = locale
      options
    end
  end
end

# Because LocaleHelper is an autoloaded constant, we need to execute the
# include from an initialization event handler. We choose after_initialize
# rather than to_prepare to avoid repeatedly modifying the class.
Rails.application.config.after_initialize do
  Devise::CustomFailure.include LocaleHelper
end
