require File.expand_path('../../../../dashboard/config/environment', __FILE__)
require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'i18n'

# Provides access to all the translations managed by the code-dot-org project.
class TranslationService
  def initialize
    # Normally we fallback to en-US, but we want to disable this so we detect missing strings.
    I18n.fallbacks.defaults = []
    I18n.backend.reload!
  end

  # Returns true if a translation exists for a given key, otherwise returns false.
  def translated?(locale, key)
    I18n.exists?(key, locale: locale)
  end
end
