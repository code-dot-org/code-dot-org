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

    warn "At setup, Honeybadger::Backend::Test.notifications[:notices].length is #{Honeybadger::Backend::Test.notifications[:notices].length}"

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
    warn "At test start, Honeybadger::Backend::Test.notifications[:notices].length is #{Honeybadger::Backend::Test.notifications[:notices].length}"

    student = create :student
    sign_in student
    get raise_error_path

    warn "Honeybadger notices there are #{Honeybadger::Backend::Test.notifications[:notices].length}:"
    Honeybadger::Backend::Test.notifications[:notices].each do |notice|
      notice_json = notice.as_json
      pp notice_json.reject {|k, _| k == :breadcrumbs}, indent: 4
      # binding.irb
    end

    notice = Honeybadger::Backend::Test.notifications[:notices].first&.as_json
    refute_nil notice

    assert_includes notice[:request][:session], "warden.user.user.key"
    assert_equal FILTERED, notice[:request][:session]["warden.user.user.key"]
  end
end
