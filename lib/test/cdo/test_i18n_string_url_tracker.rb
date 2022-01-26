require_relative '../test_helper'
require 'cdo/i18n_string_url_tracker'
require 'active_support/core_ext/numeric/time'

# Common setup/teardown for test/benchmark classes.
module SetupI18nStringUrlTracker
  # We don't want to make actual calls to the AWS Firehose apis, so stub it and verify we are trying to send the right
  # data.
  def stub_firehose
    @firehose_records = []
    FirehoseClient.instance.stubs(:put_record).with do |stream, data|
      # Capture the data we try to send to firehose so we can verify it is what we expect.
      @firehose_stream = stream
      @firehose_records << data.dup
    end
  end

  def unstub_firehose
    FirehoseClient.instance.unstub(:put_record)
    @firehose_stream = nil
    @firehose_records = nil
  end

  def stub_dcdo(flag)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(flag)
  end

  def unstub_dcdo
    DCDO.unstub(:get)
  end

  def setup
    super
    stub_firehose
    stub_dcdo(true)
  end

  def teardown
    super
    unstub_firehose
    unstub_dcdo
    I18nStringUrlTracker.instance.send(:shutdown)
  end
end

class TestI18nStringUrlTracker < Minitest::Test
  include SetupI18nStringUrlTracker

  def test_instance_not_empty
    assert I18nStringUrlTracker.instance
  end

  def test_log_given_no_string_key_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {url: 'https://code.org', source: 'test', string_key: nil, scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
  end

  def test_log_given_no_url_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {url: nil, source: 'test', normalized_key: 'string.key', string_key: 'string.key', scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
  end

  def test_log_given_no_source_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {url: 'https://code.org', source: nil, string_key: 'string.key', scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
  end

  def test_log_given_data_should_call_firehose
    test_record = {url: 'https://code.org', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_url_with_query_string_should_call_firehose_without_query_string
    test_record = {normalized: 'string.key', url: 'https://code.org/?query=true', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_url_with_anchor_tag_should_call_firehose_without_anchor_tag
    test_record = {url: 'https://code.org/#tag-youre-it', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_projects_url_should_only_log_the_project_type
    test_record = {url: 'https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/projects/flappy', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_false_dcdo_flag_should_not_call_firehose
    unstub_firehose
    unstub_dcdo
    stub_dcdo(false)
    FirehoseClient.instance.expects(:put_record).never
    test_record = {url: 'https://code.org', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
  end

  def test_log_given_http_url_should_call_firehose_with_https_url
    test_record = {url: 'http://code.org', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}

    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_unknown_studio_url_should_not_be_logged
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {url: 'https://studio.code.org/unknown/url', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
  end

  def test_log_given_studio_script_url_should_only_log_the_script_name
    test_record = {url: 'https://studio.code.org/s/dance-2019/lessons/1/levels/1', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/s/dance-2019', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_hour_of_code_url_should_be_logged
    test_record = {url: 'https://hourofcode.com', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://hourofcode.com', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_url_with_trailing_slash_should_log_without_trailing_slash
    test_record = {url: 'https://code.org/', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_home_url_should_be_logged
    test_record = {url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_teacher_dashboard_url_should_only_log_teacher_dashboard
    test_record = {url: 'https://studio.code.org/teacher_dashboard/sections/3263468/login_info', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/teacher_dashboard', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_courses_url_should_only_log_courses
    test_record = {url: 'https://studio.code.org/courses/csd-2020?section_id=3263468', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/courses', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_users_url_should_only_log_users
    test_record = {url: 'https://studio.code.org/users/edit', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/users', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_interval_should_log_data_after_the_given_time_has_passed
    test_record = {url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    interval = 0.2.seconds
    I18nStringUrlTracker.instance.send(:set_flush_interval, interval)
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    # verify that no firehose information has been logged because the interval has not passed yet
    assert_nil(@firehose_stream)
    assert_nil(@firehose_records&.first)
    # wait a little bit longer than the interval before checking if any data has been logged
    sleep(interval * 2)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_too_much_data_should_be_automatically_flushed
    test_record = {url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    I18nStringUrlTracker.instance.send(:set_buffer_size_max, 0)
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_duplicate_data_should_only_log_once
    test_record = {url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://studio.code.org/home', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    FirehoseClient.instance.expects(:put_record).once
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_given_url_with_special_symbol_should_log_the_special_symbol
    # Normally, if a special character such as a white space is in a URL,
    # it would be URL encoded to "%20"; however we want it to be logged as
    # a normal whitespace in order to make the data easier to read by analysts.
    test_record = {url: 'https://code.org/url%20with%20spaces', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    expected_record = {normalized_key: 'string.key', url: 'https://code.org/url with spaces', source: 'test', string_key: 'string.key', scope: "[]", separator: '.'}
    FirehoseClient.instance.expects(:put_record).once
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_records&.first)
  end

  def test_log_multiple_sources
    test_record = {url: 'https://code.org/url', source: 'test', string_key: 'string.key', scope: [], separator: '.'}
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source], test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.log(test_record[:url], test_record[:source] + '2', test_record[:string_key], test_record[:scope], test_record[:separator])
    I18nStringUrlTracker.instance.send(:flush)
    assert_equal %w(test test2), @firehose_records&.map {|x| x[:source]}
  end
end

require 'minitest/benchmark'
class BenchI18nStringUrlTracker < Minitest::Benchmark
  include SetupI18nStringUrlTracker

  def self.bench_range
    [1, 1, 1_000, 1_000, 2_000, 5_000, 10_000]
  end

  def bench_linear_performance
    assert_performance_linear(0.95) do |n|
      n.times {|m| I18nStringUrlTracker.instance.log(n.to_s, m.to_s, m.to_s, [], '.')}
    end
  end
end
