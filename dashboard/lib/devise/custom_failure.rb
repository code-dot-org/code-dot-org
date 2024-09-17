# Overrides the locale for Devise failures to use the same logic as our app.
module Devise
  class CustomFailure < Devise::FailureApp
    include LocaleHelper

    protected def i18n_options(options)
      options[:locale] = locale
      options
    end
  end
end
