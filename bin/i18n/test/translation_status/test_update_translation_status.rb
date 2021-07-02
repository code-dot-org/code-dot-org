require_relative '../test_helper'
require_relative '../../translation_status/translation_status_service'

class TranslationServiceTest < Minitest::Test
  def test_delete_translation_status_deletes_status_for_existing_keys
    # Should select all unique string_keys, and delete their current status.
    expected_query = <<~SQL.squish
      DELETE FROM analysis.i18n_string_translation_status
      WHERE string_key IN (
        SELECT DISTINCT string_key
        FROM analysis.i18n_string_tracking_events
        WHERE environment = 'production' AND created_at >= current_timestamp - interval '777 days' )
    SQL

    redshift = mock
    redshift.expects(:exec).with do |query|
      assert_equal expected_query, query
    end
    updater = I18n::TranslationStatus::Updater.new
    updater.delete_translation_status(redshift, 777)
  end

  def test_get_all_unique_string_keys_should_return
    # Should select all unique string_keys logged in the tracking table.
    expected_query = <<~SQL.squish
      SELECT DISTINCT string_key
      FROM analysis.i18n_string_tracking_events
      WHERE environment = 'production' AND created_at >= current_timestamp - interval '12 days'
    SQL

    redshift = mock
    redshift.expects(:exec).with do |query|
      assert_equal expected_query, query
    end.returns([{'string_key' => 'string_1'}, {'string_key' => 'string_2'}])

    updater = I18n::TranslationStatus::Updater.new
    string_keys = updater.get_all_unique_string_keys(redshift, 12)
    assert_equal %w[string_1 string_2], string_keys
  end

  def test_insert_translation_status_should_lookup_translations_and_insert_status_into_redshift
    translation_service = mock
    # Should select all unique string_keys, and delete their current status.
    expected_te_st_query = <<~SQL.squish
      INSERT INTO analysis.i18n_string_translation_status (string_key, locale, has_translation, checked_at)
      VALUES
        ('key_1', 'te_ST', 'true', '2013-01-02 01:02:03'),('key_2', 'te_ST', 'true', '2013-01-02 01:02:03')
    SQL

    expected_in_tl_query = <<~SQL.squish
      INSERT INTO analysis.i18n_string_translation_status (string_key, locale, has_translation, checked_at)
      VALUES
        ('key_1', 'in_TL', 'true', '2013-01-02 01:02:03'),('key_2', 'in_TL', 'false', '2013-01-02 01:02:03')
    SQL
    current_time = '2013-01-02 01:02:03'
    locales = %w[te_ST in_TL]
    string_keys = %w[key_1 key_2]
    translation_service.expects(:translated?).with('te_ST', 'key_1').returns(true)
    translation_service.expects(:translated?).with('te_ST', 'key_2').returns(true)
    translation_service.expects(:translated?).with('in_TL', 'key_1').returns(true)
    translation_service.expects(:translated?).with('in_TL', 'key_2').returns(false)

    redshift = mock
    redshift.expects(:exec).with(expected_te_st_query)
    redshift.expects(:exec).with(expected_in_tl_query)
    updater = I18n::TranslationStatus::Updater.new
    updater.insert_translation_status(redshift, translation_service, locales, string_keys, current_time)
  end
end
