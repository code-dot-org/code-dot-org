require_relative '../../test_helper'
require_relative '../../../cdo/crowdin/client_extentions'

class CrowdinClientExtensionsTest < Minitest::Test
  def setup
    @crowdin_client = Crowdin::Client.new do |config|
      config.api_token = 'fake_token'
    end
  end

  def test_download_languages
    # An array of stubbed responses, one for each call.
    fake_responses = [
      {'data' => [{'data' => {'id' => 'language1'}}]},
      {'data' => [{'data' => {'id' => 'language2'}}]},
      {'data' => [{'data' => {'id' => 'language3'}}]},
      {'data' => []}
    ]
    @crowdin_client.stubs(:list_languages).returns(*fake_responses)

    results = @crowdin_client.download_languages(1)

    # Expected results = [{id => ..}, {id => ...}, ...]
    expected_results = fake_responses.map do |response|
      response['data'].map do |language|
        language['data']
      end
    end.flatten

    assert_equal expected_results, results
  end
end
