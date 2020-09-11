require 'test_helper'
require 'i18n_controller'

class I18nControllerTest < ActionController::TestCase
  test "post track_string_usage should succeed" do
    string_keys = (1..100).map(&:to_s)
    url = 'http://code.org/test/level'
    source = 'test'
    args = {
      'string_keys' => string_keys,
      'url' => url,
      'source' => source
    }

    string_keys.each do |string_key|
      I18nStringUrlTracker.instance.expects(:log).with(string_key, url, source)
    end

    post :track_string_usage, params: args
    assert_response :success
  end

  test "post track_string_usage should fail given over #{I18nController::I18N_KEY_COUNT_LIMIT} strings" do
    string_keys = (1..(I18nController::I18N_KEY_COUNT_LIMIT + 1)).map(&:to_s)
    url = 'http://code.org/test/level'
    source = 'test'
    args = {
      'string_keys' => string_keys,
      'url' => url,
      'source' => source
    }

    post :track_string_usage, params: args
    assert_response 400
  end
end
