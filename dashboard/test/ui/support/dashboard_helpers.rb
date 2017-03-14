require_relative 'rails_model_helpers'

module DashboardHelpers
  include RailsModelHelpers

  # This should not be needed anymore.
  # Use require_rails_models or require_i18n instead.
  #
  # Requires the full rails environment. Use sparingly, known to take several minutes in certain contexts.
  def require_rails_env
    require File.expand_path('../../../../config/environment.rb', __FILE__)
  end

  # Loads the i18n translations.
  def require_i18n_translations
    RailsModelHelpers.require_i18n_translations
  end

  # Requires Rails models without loading the entire Rails environment (much faster).
  def require_rails_models
    RailsModelHelpers.require_rails_models
  end
end

World(DashboardHelpers)
