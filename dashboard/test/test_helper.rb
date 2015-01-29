# uncomment the below if you want to see code coverage
#  require 'simplecov'
#  SimpleCov.start :rails

require 'minitest/reporters'
MiniTest::Reporters.use! ($stdout.tty? ? Minitest::Reporters::ProgressReporter.new : Minitest::Reporters::DefaultReporter.new)

ENV["RAILS_ENV"] = "test"
ENV["RACK_ENV"] = "test"

# deal with some ordering issues -- sometimes environment is loaded before test_helper and sometimes after
CDO.rack_env = "test" if defined? CDO
Rails.application.reload_routes! if defined? Rails

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

    # sponsor message calls PEGASUS_DB, stub it so we don't have to deal with this in test
    UserHelpers.stubs(:random_donor).returns(name_s: 'Someone')

    set_env :test

    # how come this doesn't work:
    Dashboard::Application.config.action_controller.perform_caching = false
    # as in, I still need to clear the cache even though we are not 'performing' caching
    Rails.cache.clear

    AWS::S3.stubs(:upload_to_bucket).raises("Don't actually upload anything to S3 in tests... mock it if you want to test it")
  end

  teardown do
    Dashboard::Application.config.action_controller.perform_caching = false
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
    request.env['cdo.locale'] = I18n.default_locale = locale
    yield
  ensure
    request.env['cdo.locale'] = I18n.default_locale = original_locale
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

  setup do
    request.env['cdo.locale'] = 'en-US'
  end

  # override default html document to ask it to raise errors on invalid html
  def html_document
    strict = true
    xml = (@response.content_type =~ /xml$/)

    @html_document ||= HTML::Document.new(@response.body, strict, xml)
  end

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
    signed_in_user_id = session['warden.user.user.key'].try(:first).try(:first)
    if user
      assert signed_in_user_id, 'No signed in user'
      assert_equal user.id, signed_in_user_id
    else
      assert_equal nil, signed_in_user_id, "Expected no signed in user"
    end
  end
end
