require_relative '../test_helper'
require_relative '../../translation_status/translation_status_service'

class TranslationServiceTest < Minitest::Test
  def test_delete_translation_status_deletes_status_for_existing_keys
    # Should select all unique string_keys, and delete their current status.
    expected_query = get_delete_unique_keys_sql_query(777)

    redshift = mock
    redshift.expects(:exec).with(expected_query)
    updater = I18n::TranslationStatus::Updater.new
    updater.delete_translation_status(redshift, 777)
  end

  def test_get_all_unique_string_keys_should_return
    # Should select all unique string_keys logged in the tracking table.
    expected_query = get_unique_keys_sql_query(12)
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
    expected_te_st_query = get_insert_translation_status_sql_query(
      [%w[key_1 te_ST true], %w[key_2 te_ST true]]
    )

    expected_in_tl_query = get_insert_translation_status_sql_query(
      [%w[key_1 in_TL true], %w[key_2 in_TL false]]
    )
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

  def test_update_translation_status_should_delete_existing_data_and_insert_new_data
    redshift = mock
    translation_service = mock
    # Should select all unique string_keys, and delete their current status.
    expected_delete_query = get_delete_unique_keys_sql_query(333)
    redshift.expects(:exec).with(expected_delete_query)

    # Should select all unique string_keys logged in the tracking table.
    expected_unique_keys_query = get_unique_keys_sql_query(333)
    redshift.expects(:exec).with(expected_unique_keys_query).returns([{'string_key' => 'key_1'}, {'string_key' => 'key_2'}])

    # Should select all unique string_keys, and delete their current status.
    expected_te_st_query = get_insert_translation_status_sql_query(
      [%w[key_1 te_ST true], %w[key_2 te_ST true]]
    )
    expected_in_tl_query = get_insert_translation_status_sql_query(
      [%w[key_1 in_TL true], %w[key_2 in_TL false]]
    )
    translation_service.expects(:translated?).with('te_ST', 'key_1').returns(true)
    translation_service.expects(:translated?).with('te_ST', 'key_2').returns(true)
    translation_service.expects(:translated?).with('in_TL', 'key_1').returns(true)
    translation_service.expects(:translated?).with('in_TL', 'key_2').returns(false)
    redshift.expects(:exec).with(expected_te_st_query)
    redshift.expects(:exec).with(expected_in_tl_query)

    current_time = '2013-01-02 01:02:03'
    locales = %w[te_ST in_TL]
    updater = I18n::TranslationStatus::Updater.new
    updater.update_translation_status(333, locales, current_time, redshift, translation_service)
  end

  private

  def get_unique_keys_sql_query(days)
    # Should select all unique string_keys
    <<~SQL.squish
      SELECT DISTINCT string_key
      FROM analysis.i18n_string_tracking_events
      WHERE environment = 'production' AND created_at >= current_timestamp - interval '#{days} days'
    SQL
  end

  def get_delete_unique_keys_sql_query(days)
    # Should select all unique string_keys, and delete their current status.
    <<~SQL.squish
      DELETE FROM analysis.i18n_string_translation_status
      WHERE string_key IN (
         #{get_unique_keys_sql_query(days)} )
    SQL
  end

  def get_insert_translation_status_sql_query(statuses)
    values_sql = statuses.map do |status|
      "('#{status[0]}', '#{status[1]}', '#{status[2]}', '2013-01-02 01:02:03')"
    end.join(',')
    <<~SQL.squish
      INSERT INTO analysis.i18n_string_translation_status (string_key, locale, has_translation, checked_at)
      VALUES
        #{values_sql}
    SQL
  end
end
