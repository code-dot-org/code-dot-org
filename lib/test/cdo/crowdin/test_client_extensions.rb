require_relative '../../test_helper'
require_relative '../../../cdo/crowdin/client_extentions'

class CrowdinClientExtensionsTest < Minitest::Test
  def setup
    @crowdin_client = Crowdin::Client.new do |config|
      config.api_token = 'fake_token'
    end
  end

  def test_download_languages
    # Download 1 record per API call
    limit = 1
    # An array of stubbed responses, one for each API call.
    fake_responses = [
      {'data' => [{'data' => {'id' => 'language1'}}]},
      {'data' => [{'data' => {'id' => 'language2'}}]},
      # this response should stop the downloading loop
      {'data' => []}
    ]
    @crowdin_client.stubs(:list_languages).returns(*fake_responses)

    results = @crowdin_client.download_languages(limit)
    assert_equal fake_responses.size - 1, results.size
  end

  def test_download_translations
    # Download 1 record per API call
    limit = 1
    # An array of stubbed responses, one for each API call.
    fake_responses = [
      {'data' => [{'data' => {'stringId' => 1, 'translationId' => 1}}]},
      {'data' => [{'data' => {'stringId' => 2, 'translationId' => 2}}]},
      # this response should stop the downloading loop
      {'data' => []}
    ]
    @crowdin_client.stubs(:list_language_translations).returns(*fake_responses)

    results = @crowdin_client.download_translations(
      'project_name',
      'crowdin_language_id',
      %w[user1 user2],
      'start_date',
      'end_date',
      limit
    )
    assert_equal fake_responses.size - 1, results.size
  end

  def test_download_source_strings
    # Download 1 record per API call
    limit = 1
    # An array of stubbed responses, one for each API call.
    fake_responses = [
      {'data' => [{'data' => {'id' => 1, 'text' => 'string1'}}]},
      {'data' => [{'data' => {'id' => 2, 'text' => 'string2'}}]},
      # this response should stop the downloading loop
      {'data' => []}
    ]
    @crowdin_client.stubs(:list_strings).returns(*fake_responses)

    results = @crowdin_client.download_source_strings(
      'project_name',
      'crowdin_language_id',
      %w[user1 user2],
      'start_date',
      'end_date',
      limit
    )
    assert_equal fake_responses.size - 1, results.size
  end

  def test_create_user_query
    assert_equal '(user=@user:"user1")', @crowdin_client.create_user_query(['user1'])
    assert_equal '(user=@user:"user1" or user=@user:"user2")', @crowdin_client.create_user_query(%w[user1 user2])
  end
end
