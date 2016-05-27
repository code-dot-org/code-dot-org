if ENV['COVERAGE'] # set this environment variable when running tests if you want to see test coverage
  require 'simplecov'
  SimpleCov.start :rails
elsif ENV['CI'] # this is set by travis and circle
  require 'coveralls'
  Coveralls.wear!('rails')
end

require 'minitest/reporters'
MiniTest::Reporters.use!($stdout.tty? ? Minitest::Reporters::ProgressReporter.new : Minitest::Reporters::DefaultReporter.new)

ENV["RAILS_ENV"] = "test"
ENV["RACK_ENV"] = "test"

# deal with some ordering issues -- sometimes environment is loaded
# before test_helper and sometimes after. The CDO stuff uses RACK_ENV,
# but running unit tests in the test env for developers only sets
# RAILS ENV. We fix it above but we need to reload some stuff...

CDO.rack_env = "test" if defined? CDO
Rails.application.reload_routes! if defined? Rails

require File.expand_path('../../config/environment', __FILE__)
I18n.load_path += Dir[Rails.root.join('test', 'en.yml')]
I18n.backend.reload!

Dashboard::Application.config.action_mailer.default_url_options = { host: CDO.canonical_hostname('studio.code.org'), protocol: 'https' }
Devise.mailer.default_url_options = Dashboard::Application.config.action_mailer.default_url_options

require 'rails/test_help'

require 'mocha/mini_test'

# Raise exceptions instead of rendering exception templates.
Dashboard::Application.config.action_dispatch.show_exceptions = false

require 'dynamic_config/gatekeeper'
require 'dynamic_config/dcdo'

class ActiveSupport::TestCase
  ActiveRecord::Migration.check_pending!

  setup do
    # sponsor message calls PEGASUS_DB, stub it so we don't have to deal with this in test
    UserHelpers.stubs(:random_donor).returns(name_s: 'Someone')
    AWS::S3.stubs(:upload_to_bucket).raises("Don't actually upload anything to S3 in tests... mock it if you want to test it")

    set_env :test

    # how come this doesn't work:
    Dashboard::Application.config.action_controller.perform_caching = false
    # as in, I still need to clear the cache even though we are not 'performing' caching
    Rails.cache.clear

    # clear log of 'delivered' mails
    ActionMailer::Base.deliveries.clear

    Gatekeeper.clear
    DCDO.clear
  end

  teardown do
    Dashboard::Application.config.action_controller.perform_caching = false
    set_env :test
  end

  def panda_panda
    # this is the panda face emoji which is a 4 byte utf8 character
    # (some of our db tables can't handle these)
    "Panda\u{1F43C}"
  end

  def set_env(env)
    Rails.env = env.to_s
    CDO.rack_env = env
  end

  # some s3 helpers/mocks
  def expect_s3_upload
    CDO.disable_s3_image_uploads = false
    AWS::S3.expects(:upload_to_bucket).returns(true)
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
      # rubocop:disable Lint/Eval
      e.respond_to?(:call) ? e : lambda { eval(e, block.binding) }
      # rubocop:enable Lint/Eval
    }
    before = exps.map(&:call)

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
      # rubocop:disable Lint/Eval
      e.respond_to?(:call) ? e : lambda { eval(e, block.binding) }
      # rubocop:enable Lint/Eval
    }
    before = exps.map(&:call)

    yield

    expressions.zip(exps).each_with_index do |(code, e), i|
      error  = "#{code.inspect} didn't change"
      error  = "#{message}.\n#{error}" if message
      assert_equal(before[i], e.call, error)
    end
  end

  # Given two hashes, ensure that they have the same set of keys in both
  # directions, collecting up errors so we can pretty-print them all in one go
  # if any errors are found.
  def assert_same_keys(a, b, a_name = 'A', b_name = 'B', message = "Keys don't match")
    assert_equal a.keys, b.keys, %(#{message}
  Found in #{a_name} but not #{b_name}: #{(a.keys - b.keys).join(', ')}
  Found in #{b_name} but not #{a_name}: #{(b.keys - a.keys).join(', ')})
  end

  # Given a regular expression and a block, ensure that the block raises an
  # exception with a message matching the regular expression.
  def assert_raises_matching(matcher)
    assert_raises do
      begin
        yield
      rescue => err
        assert_match matcher, err.to_s
        raise err
      end
    end
  end

  # Freeze time for the each test case to 9am, or the specified time
  # To use, declare anywhere in the test class:
  #   class MyTest < ActiveSupport::TestCase
  #     freeze_time
  #     #...
  def self.freeze_time(time=nil)
    time ||= Date.today + 9.hours
    setup do
      Timecop.freeze time
    end
    teardown do
      Timecop.return
    end
  end
end

# Helpers for all controller test cases
class ActionController::TestCase
  include Devise::TestHelpers

  setup do
    ActionDispatch::Cookies::CookieJar.always_write_cookie = true
    request.env["devise.mapping"] = Devise.mappings[:user]
    request.env['cdo.locale'] = 'en-US'
  end

  # override default html document to ask it to raise errors on invalid html
  def html_document
    @html_document ||= if @response.content_type === Mime::XML
                         Nokogiri::XML::Document.parse(@response.body, &:strict)
                       else
                         Nokogiri::HTML::Document.parse(@response.body, &:strict)
                       end
  end

  def assert_redirected_to_sign_in
    assert_response :redirect
    assert_redirected_to "http://test.host/users/sign_in"
  end

  def self.generate_admin_only_tests_for(action, params = {})
    test "should get #{action}" do
      sign_in create(:admin)
      get action, params
      assert_response :success
    end

    test "should not get #{action} if not signed in" do
      sign_out :user
      get action, params
      assert_redirected_to_sign_in
    end

    test "should not get #{action} if not admin" do
      sign_in create(:user)
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

  def assert_sharing_meta_tags(opts={})
    # example:
    # <meta content="500177453358606" property="fb:app_id" />
    # <meta content="article" property="og:type" />
    # <meta content="Code.org" property="og:site_name" />
    # <meta content="Check out what I made" property="og:title" />
    # <meta content="I wrote the code myself with Code.org" property="og:description" />
    # <meta content="http://localhost:3000/assets/sharing_drawing.png" property="og:image" />
    # <meta content="https://www.facebook.com/Code.org" property="article:publisher" />
    # <meta content="http://localhost:3000/p/artist" property="og:url" />
    # <meta content="Check out what I made" name="twitter:title" />
    # <meta content="I wrote the code myself with Code.org" name="twitter:description" />
    # <meta content="@codeorg" name="twitter:site" />
    # <meta content="photo" name="twitter:card" />
    # <meta content="http://localhost:3000/assets/sharing_drawing.png" name="twitter:image" />
    # <meta content="http://localhost:3000/p/artist" name="twitter:url" />
    # <meta content="500" property="og:image:width" />
    # <meta content="261" property="og:image:height" />
    # <meta content="500" name="twitter:image:width" />
    # <meta content="261" name="twitter:image:height" />

    # if this test is breaking and you don't know what's going on, you
    # can print the meta tags like this:

    # puts css_select('meta').collect(&:to_s).join("\n")

    # constants
    assert_select 'meta[property="fb:app_id"][content="500177453358606"]'
    assert_select 'meta[content="Code.org"][property="og:site_name"]'
    assert_select 'meta[content="article"][property="og:type"]'
    assert_select 'meta[content="https://www.facebook.com/Code.org"][property="article:publisher"]'

    assert_select 'meta[content="@codeorg"][name="twitter:site"]'
    assert_select 'meta[content="photo"][name="twitter:card"]'

    {og: 'property', twitter: 'name'}.each do |namespace, attr|
      # descriptions
      assert_select "meta[content='Check out what I made'][#{attr}='#{namespace}:title']"

      # url
      assert_select "meta[content='#{opts[:url]}'][#{attr}='#{namespace}:url']" if opts[:url]

      # image
      assert_select "meta[content='#{opts[:image_url]}'][#{attr}='#{namespace}:image']" if opts[:image_url]
      assert_select "meta[content='#{opts[:image_width]}'][#{attr}='#{namespace}:image:width']" if opts[:image_width]
      assert_select "meta[content='#{opts[:image_height]}'][#{attr}='#{namespace}:image:height']" if opts[:image_height]
    end

    if opts[:apple_mobile_web_app]
      # ios icons
      assert_select 'meta[content="yes"][name="apple-mobile-web-app-capable"]'
      assert_select 'meta[content="black-translucent"][name="apple-mobile-web-app-status-bar-style"]'
    end
  end
end

class ActionDispatch::IntegrationTest
  setup do
    https!
  end
end

# Evaluates the given block temporarily setting the global locale to the specified locale.
def with_locale(locale)
  old_locale = I18n.locale
  begin
    I18n.locale = locale
    yield
  ensure
    I18n.locale = old_locale
  end
end

# Mock StorageApps to generate random tokens
class StorageApps
  def initialize(_); end

  def create(_, _)
    SecureRandom.base64 18
  end

  def most_recent(_)
    create(nil, nil)
  end
end

# Mock storage_id to generate random IDs
def storage_id(_)
  SecureRandom.hex
end

$stub_encrypted_channel_id = 'STUB_CHANNEL_ID-1234'
def storage_encrypt_channel_id(_)
  $stub_encrypted_channel_id
end

$stub_channel_owner = 33
$stub_channel_id = 44
# stubbing storage_decrypt is inappropriate access, but
# allows storage_decrypt_channel_id to throw the right
# errors if the input is malformed and keeps us from
# having to access the Pegasus DB from Dashboard tests.
def storage_decrypt(encrypted)
  "#{$stub_channel_owner}:#{$stub_channel_id}"
end

# A fake slogger implementation that captures the records written to it.
class FakeSlogger
  attr_reader :records

  def initialize
    @records = []
  end

  def write(json)
    @records << json
  end
end

def json_response
  JSON.parse @response.body
end
