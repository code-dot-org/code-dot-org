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
require 'cdo/ci_utils'

raise 'Test helper must only be used in `test` environment!' unless rack_env? :test

module Minitest::Assertions
  # Include assertions defined in ActiveSupport such as assert_changes, etc.
  include ActiveSupport::Testing::Assertions
end

# AWS documentation placeholder account, used in place of our real account
# number so that account numbers are never committed to this public repository.
# See https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html
DUMMY_AWS_ACCOUNT_ID = '123456789012'.freeze

# If +value+ is an ARN, return it with its account number replaced by the dummy
# account; otherwise return +value+ unchanged. Parses with the AWS SDK's ARN
# parser rather than a regular expression.
def obfuscate_arn_account_id(value)
  return value unless value.is_a?(String) && Aws::ARNParser.arn?(value)
  arn = Aws::ARNParser.parse(value)
  Aws::ARN.new(
    partition: arn.partition,
    service: arn.service,
    region: arn.region,
    account_id: DUMMY_AWS_ACCOUNT_ID,
    resource: arn.resource
  ).to_s
rescue Aws::Errors::InvalidARNError
  # arn? only checks for the "arn:" prefix, so a malformed value can still fail
  # to parse. Leave anything unparseable untouched.
  value
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
      Amz-Sdk-Invocation-Id
    ).each {|h| i.request.headers.delete h}
    # X-Amz-Server-Side-Encryption-Aws-Kms-Key-Id contains the KMS key ARN,
    # which includes our AWS account number; cassettes are committed to a
    # public repository, so drop it.
    %w(
      X-Amz-Request-Id
      X-Amz-Id-2
      X-Amz-Server-Side-Encryption-Aws-Kms-Key-Id
    ).each {|h| i.response.headers.delete h}
    # Any remaining header whose value is an ARN still embeds our AWS account
    # number; replace it with the documentation placeholder account.
    [i.request, i.response].each do |part|
      part.headers.each_value do |values|
        values.map! {|v| obfuscate_arn_account_id(v)}
      end
    end
  end
end

# Dashboard tables emptied before each test to ensure repeatable tests.
DASHBOARD_TEST_TABLES = %w(channel_tokens project_storage_geos user_project_storage_ids projects project_commits code_review_comments code_reviews).freeze

module SetupTest
  # Empty the dashboard tables used by these tests and reset their
  # AUTO_INCREMENT counters. The counters matter because auto-increment ids
  # are embedded in the S3 paths recorded in VCR cassettes
  # ("<dir>/<storage_id>/<project_id>/..."), so each test must start from
  # identical counter values or playback will not match. Rolling back a transaction
  # does not rewind the AUTO_INCREMENT counter, hence the explicit reset.
  def self.reset_dashboard_test_tables
    DASHBOARD_TEST_TABLES.each do |table|
      # rubocop:disable CustomCops/DashboardDbUsage
      DASHBOARD_DB[table.to_sym].delete
      DASHBOARD_DB.execute("ALTER TABLE `#{table}` AUTO_INCREMENT = 1")
      # rubocop:enable CustomCops/DashboardDbUsage
    end
  end

  def around(&block)
    # Reset table state before the test rather than after: cleanup placed
    # after the test body is skipped when the test fails or errors, and a
    # single skipped reset drifts the auto-increment ids for every
    # subsequent test in the process, which VCR then rejects as unrecorded
    # HTTP requests.
    SetupTest.reset_dashboard_test_tables

    random = Random.new(0)
    # 4 test wrappers:
    # VCR (record/replay HTTP interactions)
    # Stub AWS credentials
    # Transaction rollback (leave behind no database side-effects)
    # Stub AWS::S3#random
    cassette_name = "#{self.class.to_s.chomp('Test').downcase}/#{@NAME.gsub('test_', '')}"
    # Fail on empty/missing cassette in CI or during DTT.
    record_mode = ENV['CI'] || CDO.chef_managed ? :none : :once
    credentials = VCR::Cassette.new(cassette_name).recording? ?
      # Load AWS credentials before VCR recording starts.
      Aws::CredentialProviderChain.new.resolve :
      # If not currently recording, stub fake/invalid AWS credentials.
      Aws::Credentials.new('test_aws_key', 'test_aws_secret')
    Aws::CredentialProviderChain.
      any_instance.
      stubs(:static_credentials).
      returns(credentials)

    # Our various `*_s3_directory` options contain the commit hash when running
    # in the test environment, so new projects created during UI tests will not
    # already contain data generated by previous test runs. However, this is
    # not compatible with our unit tests which use VCR to stub out network
    # requests to url paths which must be consistent across test runs.
    # Therefore, remove the commit-specific part of these paths only in unit tests.
    %w(animations assets files libraries sources).each do |content_type|
      CDO.stubs("#{content_type}_s3_directory").returns("#{content_type}_test")
    end

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
      # rubocop:enable CustomCops/PegasusDbUsage
      # rubocop:enable CustomCops/DashboardDbUsage
    end
  ensure
    # Return connection validation to default settings. The pool only
    # responds to this once the connection_validator extension has loaded,
    # which the test may have failed before reaching.
    # rubocop:disable CustomCops/PegasusDbUsage
    # rubocop:disable CustomCops/DashboardDbUsage
    [PEGASUS_DB, DASHBOARD_DB].each do |db|
      db.pool.connection_validation_timeout = 3600 if db.pool.respond_to?(:connection_validation_timeout=)
    end
    # rubocop:enable CustomCops/PegasusDbUsage
    # rubocop:enable CustomCops/DashboardDbUsage

    # Cached S3-client objects contain AWS credentials,
    # so reset them to ensure that they are not reused across tests.
    BucketHelper.s3_client = nil if defined?(BucketHelper)
    AWS::S3.s3 = nil
  end
end

# Also reset at load, for tests that read these tables without SetupTest.
SetupTest.reset_dashboard_test_tables
