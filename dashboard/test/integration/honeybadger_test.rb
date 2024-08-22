require 'test_helper'

class HoneybadgerErrorController < ApplicationController
  def raise_error
    Honeybadger.notify("Test Error!")
    raise "Test Error!"
  end
end

class HoneybadgerTest < ActionDispatch::IntegrationTest
  setup do
    Rails.application.routes.draw do
      get 'raise_error' => 'honeybadger_error#raise_error'
    end

    Honeybadger.configure do |config|
      @original_backend = config.backend
      config.backend = 'test'
      @original_api_key = config.api_key
      config.api_key = 'test_key'
    end
  end

  teardown do
    Rails.application.reload_routes!

    Honeybadger.configure do |config|
      config.backend = @original_backend
      config.api_key = @original_api_key
    end
  end

  # The value Honeybadger will set a filtered value to.
  FILTERED = "[FILTERED]"

  test "does NOT log encrypted data" do
    student = create :student
    sign_in student

    get raise_error_path

    notice = Honeybadger::Backend::Test.notifications[:notices].find {|n| n.controller == "honeybadger_error"}
    refute_nil notice
    assert_equal FILTERED, notice.as_json[:request][:session]["warden.user.user.key"]
  end
end
