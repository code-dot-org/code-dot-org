require_relative '../test_helper'
require 'cdo/i18n_string_url_tracker'

class TestI18nStringUrlTracker < Minitest::Test
  # We don't want to make actual calls to the AWS Firehose apis, so stub it and verify we are trying to send the right
  # data.
  def stub_firehose
    FirehoseClient.instance.stubs(:put_record).with do |stream, data|
      # Capture the data we try to send to firehose so we can verify it is what we expect.
      @firehose_stream = stream
      @firehose_record = data.dup
      true
    end
  end

  def unstub_firehose
    FirehoseClient.instance.unstub(:put_record)
    @firehose_stream = nil
    @firehose_record = nil
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
  end

  def test_instance_not_empty
    assert I18nStringUrlTracker.instance
  end

  def test_log_given_no_string_key_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {string_key: nil, url: 'http://some.url.com/', source: 'test'}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
  end

  def test_log_given_no_url_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {string_key: 'string.key', url: nil, source: 'test'}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
  end

  def test_log_given_no_source_should_not_call_firehose
    unstub_firehose
    FirehoseClient.instance.expects(:put_record).never
    test_record = {string_key: 'string.key', url: 'http://some.url.com/', source: nil}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
  end

  def test_log_given_data_should_call_firehose
    test_record = {string_key: 'string.key', url: 'http://some.url.com/', source: 'test'}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
    assert_equal(:i18n, @firehose_stream)
    assert_equal(@firehose_record, test_record)
  end

  def test_log_given_url_with_query_string_should_call_firehose_without_query_string
    test_record = {string_key: 'string.key', url: 'http://some.url.com/?query=true', source: 'test'}
    expected_record = {string_key: 'string.key', url: 'http://some.url.com/', source: 'test'}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
    assert_equal(:i18n, @firehose_stream)
    assert_equal(expected_record, @firehose_record)
  end

  def test_log_given_false_dcdo_flag_should_not_call_firehose
    unstub_firehose
    unstub_dcdo
    stub_dcdo(false)
    FirehoseClient.instance.expects(:put_record).never
    test_record = {string_key: 'string.key', url: 'http://some.url.com/', source: 'test'}
    I18nStringUrlTracker.instance.log(test_record[:string_key], test_record[:url], test_record[:source])
  end

  def test_normalize_url_given_nil_returns_nil
    assert_nil(I18nStringUrlTracker.normalize_url(nil))
  end

  def test_normalize_url_given_blank_url_returns_blank_url
    assert_equal('', I18nStringUrlTracker.normalize_url(''))
  end

  def test_normalize_url_should_strip_query_string
    url = 'https://studio.code.org/test/page?querystring=true'
    expected_url = 'https://studio.code.org/test/page'
    normalized_url = I18nStringUrlTracker.normalize_url(url)
    assert_equal(expected_url, normalized_url)
  end

  def test_normalize_url_should_strip_anchor_tags
    url = 'https://studio.code.org/test/page#tag-youre-it'
    expected_url = 'https://studio.code.org/test/page'
    normalized_url = I18nStringUrlTracker.normalize_url(url)
    assert_equal(expected_url, normalized_url)
  end

  def test_normalize_url_should_aggregate_project_urls
    url = 'https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view'
    expected_url = 'https://studio.code.org/projects/flappy'
    normalized_url = I18nStringUrlTracker.normalize_url(url)
    assert_equal(expected_url, normalized_url)
  end
end
