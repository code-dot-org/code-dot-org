require_relative '../test_helper'
require_relative '../../translation_status/translation_service'

class TranslationServiceTest < Minitest::Test
  # Use the same service for all the tests because initialization is very slow
  @@translation_service = TranslationService.new

  def test_translated_given_english_hello_should_return_true
    assert @@translation_service.translated?('en-US', 'hello')
  end

  def test_translated_given_lowercase_english_locale_should_return_true
    assert @@translation_service.translated?('en-us', 'hello')
  end

  def test_translated_given_german_hello_should_return_true
    assert @@translation_service.translated?('de-DE', 'hello')
  end

  def test_translated_given_es_hello_should_return_true
    assert @@translation_service.translated?('es-ES', 'hello')
  end

  def test_translated_given_pt_hello_should_return_true
    assert @@translation_service.translated?('pt-BR', 'hello')
  end

  def test_translated_given_a_unknown_string_key_should_return_false
    refute @@translation_service.translated?('en-US', 'xxxxxxxxxxxxxxxxxxxxx_does_not_exist')
  end

  def test_translated_given_a_unknown_locale_should_return_false
    refute @@translation_service.translated?('xx-XX', 'hello')
  end

  def test_translated_given_dashboard_string_should_return_true
    assert @@translation_service.translated?('es-MX', :unplugged_activity)
  end

  def test_translated_given_pegasus_string_should_return_true
    assert @@translation_service.translated?('es-MX', :anybody_can_learn)
  end
end
