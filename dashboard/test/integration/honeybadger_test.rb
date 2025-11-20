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

  test "does NOT log warden session data" do
    skip 'races the reconfiguration and errors if it contacts real honeybadger server'
    student = create(:student)
    sign_in student

    get raise_error_path

    # Ensure that the notifications hit the backend queue
    Honeybadger.flush

    # Other tests running in parallel might have logged notices too, but we're only interested in notices about our test controller
    notice = Honeybadger::Backend::Test.notifications[:notices].find {|n| n.controller == "honeybadger_error"}
    refute_nil notice

    # Verify no warden keys exist in session data
    session_data = notice.as_json[:request][:session]
    warden_keys = session_data.keys.select {|key| key.to_s.start_with?('warden.')}
    assert_empty warden_keys, "Warden keys should be completely removed, but found: #{warden_keys}"
  end

  test "sets user_id context for authenticated users" do
    skip 'races the reconfiguration and errors if it contacts real honeybadger server'
    student = create(:student)
    sign_in student

    get raise_error_path

    # Ensure that the notifications hit the backend queue
    Honeybadger.flush

    # Find our test notice
    notice = Honeybadger::Backend::Test.notifications[:notices].find {|n| n.controller == "honeybadger_error"}
    refute_nil notice

    # Verify user_id is set in context
    context_data = notice.as_json[:request][:context]
    assert_equal student.id, context_data[:user_id], "user_id should be set in Honeybadger context"
  end
end
