require 'test_helper'

class LazyLocaleBackendTest < ActiveSupport::TestCase
  test 'eager load all locales in load path' do
    # Ensures all locale files in the load path load properly
    # even when lazy-locale backend is in use.
    I18n.backend.load_translations
  end
end
