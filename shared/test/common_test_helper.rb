# Common settings shared across unit tests for shared, pegasus, lib
ENV['RACK_ENV'] = 'test'
ENV['UNIT_TEST'] = '1'

require 'fakefs/safe'
require 'minitest/autorun'
require 'rack/test'
require 'minitest/reporters'
require 'minitest/around/unit'
require 'minitest-spec-context'
require 'minitest/stub_const'
require 'active_support/testing/assertions'
require 'mocha/mini_test'
require 'vcr'
require_relative '../../deployment'
require 'cdo/db'
require 'cdo/aws/s3'

raise 'Test helper must only be used in `test` environment!' unless rack_env? :test

module Minitest::Assertions
  # Include assertions defined in ActiveSupport such as assert_changes, etc.
  include ActiveSupport::Testing::Assertions
end

VCR.configure do |c|
  c.cassette_library_dir = File.expand_path 'fixtures/vcr', __dir__
  c.allow_http_connections_when_no_cassette = true
  c.hook_into :webmock
  # Filter unnecessary headers from the http interactions.
  c.before_record do |i|
    %w(
      X-Amz-Security-Token
      X-Amz-Content-Sha256
      Authorization
      X-Amz-Date
      Accept
      Accept-Encoding
      User-Agent
      Host
      Content-Type
    ).each {|h| i.request.headers.delete h}
    %w(
      X-Amz-Request-Id
      X-Amz-Id-2
    ).each {|h| i.response.headers.delete h}
  end
end

# Truncate database tables to ensure repeatable tests.
DASHBOARD_TEST_TABLES = %w(channel_tokens user_project_storage_ids projects project_commits code_review_comments code_reviews).freeze
DASHBOARD_TEST_TABLES.each do |table|
  # rubocop:disable CustomCops/DashboardDbUsage
  DASHBOARD_DB[table.to_sym].truncate
  # rubocop:enable CustomCops/DashboardDbUsage
end.freeze

module SetupTest
  def around(&block)
    random = Random.new(0)
    # 4 test wrappers:
    # VCR (record/replay HTTP interactions)
    # Stub AWS credentials
    # Transaction rollback (leave behind no database side-effects)
    # Stub AWS::S3#random
    cassette_name = "#{self.class.to_s.chomp('Test').downcase}/#{@NAME.gsub('test_', '')}"
    # Fail on empty/missing cassette in CI environments
    record_mode = ENV['CI'] ? :none : :once
    credentials = VCR::Cassette.new(cassette_name).recording? ?
      # Load AWS credentials before VCR recording starts.
      Aws::CredentialProviderChain.new.resolve :
      # If not currently recording, stub fake/invalid AWS credentials.
      Aws::Credentials.new('test_aws_key', 'test_aws_secret')
    Aws::CredentialProviderChain.
      any_instance.
      stubs(:static_credentials).
      returns(credentials)

    # CDO.sources_s3_directory contains the commit hash when running in the test
    # environment, so new projects created during UI tests will not already
    # contain source code generated from previous test runs. However, this is
    # not compatible with our unit tests which use VCR to stub out network
    # requests to url paths which must be consistent across test runs.
    # Therefore, remove the commit-specific part of this path only in unit tests.
    CDO.stubs(sources_s3_directory: 'sources_test')
    CDO.stubs(newrelic_logging: true)

    VCR.use_cassette(cassette_name, record: record_mode) do
      # rubocop:disable CustomCops/PegasusDbUsage
      # rubocop:disable CustomCops/DashboardDbUsage

      # The nested transaction seems to cause a database connection failure in some cases. Ensure that the connection
      # is validated before trying to use it and create a new one if not.
      PEGASUS_DB.extension(:connection_validator)
      PEGASUS_DB.pool.connection_validation_timeout = -1

      DASHBOARD_DB.extension(:connection_validator)
      DASHBOARD_DB.pool.connection_validation_timeout = -1

      PEGASUS_DB.transaction(rollback: :always) do
        DASHBOARD_DB.transaction(rollback: :always) do
          # Use Minitest#stub here even though we generally prefer Mocha#stubs.
          # Mocha keeps its stubbing logic simple in an attempt to avoid
          # overcomplicating tests, but in this case we specifically do need a
          # dynamic return value, which Mocha does not support.
          # rubocop:disable CustomCops/PreferMochaStubsToMinitestStub
          AWS::S3.stub(:random, proc {random.bytes(16).unpack1('H*')}, &block)
          # rubocop:enable CustomCops/PreferMochaStubsToMinitestStub
        end
      end

      # Return connection validation to default settings.
      PEGASUS_DB.pool.connection_validation_timeout = 3600
      DASHBOARD_DB.pool.connection_validation_timeout = 3600
      # rubocop:enable CustomCops/PegasusDbUsage
      # rubocop:enable CustomCops/DashboardDbUsage
    end

    # Cached S3-client objects contain AWS credentials,
    # so reset them to ensure that they are not reused across tests.
    BucketHelper.s3 = nil if defined?(BucketHelper)
    AWS::S3.s3 = nil

    # Reset AUTO_INCREMENT, since it is unaffected by transaction rollback.
    DASHBOARD_TEST_TABLES.each do |table|
      # rubocop:disable CustomCops/DashboardDbUsage
      DASHBOARD_DB.execute("ALTER TABLE `#{table}` AUTO_INCREMENT = 1")
      # rubocop:enable CustomCops/DashboardDbUsage
    end
  end
end
