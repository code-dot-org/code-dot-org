if ENV["CODECLIMATE_REPO_TOKEN"]
  require "codeclimate-test-reporter"
  CodeClimate::TestReporter.start
else
# there can be only one code coverage tool
  require 'simplecov'
  SimpleCov.start :rails
end

ENV["RAILS_ENV"] ||= "test"

require File.expand_path('../../config/environment', __FILE__)
I18n.load_path += Dir[Rails.root.join('test', 'en.yml')]
I18n.backend.reload!

require 'rails/test_help'

require "mocha/test_unit"

# Raise exceptions instead of rendering exception templates.
Dashboard::Application.config.action_dispatch.show_exceptions = false#

class ActiveSupport::TestCase
  ActiveRecord::Migration.check_pending!

  setup do
    set_env :test

    AWS::S3.stubs(:upload_to_bucket).raises("Don't actually upload anything to S3 in tests... mock it if you want to test it")
  end

  teardown do
    set_env :test
  end

  def set_env(env)
    Rails.env = env.to_s
    CDO.rack_env = env
  end


  # some s3 helpers/mocks
  def expect_s3_upload
    CDO.disable_s3_image_uploads = false
    AWS::S3.expects(:upload_to_bucket).returns(true).twice
  end

  def expect_s3_upload_failure
    CDO.disable_s3_image_uploads = false
    AWS::S3.expects(:upload_to_bucket).returns(nil)
  end

  def expect_no_s3_upload
    CDO.disable_s3_image_uploads = false
    AWS::S3.expects(:upload_to_bucket).never
  end


  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...
  include FactoryGirl::Syntax::Methods

  def assert_creates(*args)
    assert_difference(args.collect(&:to_s).collect {|class_name| "#{class_name}.count"}) do
      yield
    end
  end

  def assert_does_not_create(*args)
    assert_no_difference(args.collect(&:to_s).collect {|class_name| "#{class_name}.count"}) do
      yield
    end
  end

  def with_default_locale(locale)
    original_locale = I18n.default_locale
    I18n.default_locale = locale
    yield
  ensure
    I18n.default_locale = original_locale
  end

  # Based on assert_difference http://api.rubyonrails.org/classes/ActiveSupport/Testing/Assertions.html#method-i-assert_difference
  # just checks using not_equal instead of a numeric difference so you can compare non-numeric things
  def assert_change(expressions, message = nil, &block)
    expressions = Array(expressions)

    exps = expressions.map { |e|
      e.respond_to?(:call) ? e : lambda { eval(e, block.binding) }
    }
    before = exps.map { |e| e.call }

    yield

    expressions.zip(exps).each_with_index do |(code, e), i|
      error  = "#{code.inspect} didn't change"
      error  = "#{message}.\n#{error}" if message
      assert_not_equal(before[i], e.call, error)
    end
  end

  # Based on assert_difference http://api.rubyonrails.org/classes/ActiveSupport/Testing/Assertions.html#method-i-assert_difference
  # just checks using equal instead of a numeric difference so you can compare non-numeric things
  def assert_no_change(expressions, message = nil, &block)
    expressions = Array(expressions)

    exps = expressions.map { |e|
      e.respond_to?(:call) ? e : lambda { eval(e, block.binding) }
    }
    before = exps.map { |e| e.call }

    yield

    expressions.zip(exps).each_with_index do |(code, e), i|
      error  = "#{code.inspect} didn't change"
      error  = "#{message}.\n#{error}" if message
      assert_equal(before[i], e.call, error)
    end
  end
end


# Helpers for all controller test cases
class ActionController::TestCase
  include Devise::TestHelpers

  def assert_redirected_to_sign_in
    assert_response :redirect
    assert_redirected_to "http://test.host/users/sign_in"
  end


  def self.generate_admin_only_tests_for(action, params = {})
    test "should get #{action}" do
      get action, params
      assert_response :success
    end

    test "should not get #{action} if not signed in" do
      sign_out @admin
      get action, params
      assert_redirected_to_sign_in
    end

    test "should not get #{action} if not admin" do
      sign_in @not_admin
      get action, params
      assert_response :forbidden
    end
  end

  def css(selector)
    Nokogiri::HTML(@response.body).css(selector)
  end

  def assert_signed_in_as(user)
    assert false, 'no logged in user' unless session['warden.user.user.key'].try(:first).try(:first)
    assert_equal user.id, session['warden.user.user.key'].first.first
  end
end

