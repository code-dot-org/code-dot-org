require_relative '../src/env'
require_relative '../src/forms'
require 'minitest/autorun'

class VolunteerFormsTest < Minitest::Test
  # Make sure that cached localized strings are cached separately based on the current locale.
  def test_cached_localized_strings
    old_locale = I18n.locale
    I18n.locale = 'en-US'
    en_experiences = VolunteerEngineerSubmission2015.experiences
    I18n.locale = 'fr-FR'
    es_experiences = VolunteerEngineerSubmission2015.experiences
    I18n.locale = old_locale
    refute_equal en_experiences['unspecified'], es_experiences['unspecified']
  end
end
