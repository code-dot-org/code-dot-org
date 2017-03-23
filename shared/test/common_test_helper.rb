# Common settings shared across unit tests for shared, pegasus, lib
ENV['RACK_ENV'] = 'test'

require 'minitest/autorun'
require 'rack/test'
require 'minitest/reporters'
require 'minitest/around/unit'
require 'mocha/mini_test'
require 'vcr'
require_relative '../../deployment'
require 'cdo/db'
require 'cdo/aws/s3'

raise 'Test helper must only be used in `test` environment!' unless rack_env? :test

VCR.configure do |c|
  c.cassette_library_dir = File.expand_path 'fixtures/vcr', __dir__
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
    ).each { |h| i.request.headers.delete h }
    %w(
      X-Amz-Request-Id
      X-Amz-Id-2
    ).each { |h| i.response.headers.delete h }
  end
end

# Truncate database tables to ensure repeatable tests.
TEST_TABLES = %w(storage_apps user_storage_ids).freeze
TEST_TABLES.each do |table|
  PEGASUS_DB[table.to_sym].truncate
end.freeze

module SetupTest
  def around(&block)
    random = Random.new(0)
    # 4 test wrappers:
    # VCR (record/replay HTTP interactions)
    # Stub fake AWS credentials
    # Transaction rollback (leave behind no database side-effects)
    # Stub AWS::S3#random
    VCR.use_cassette("#{self.class.to_s.chomp('Test').downcase}/#{@NAME.gsub('test_', '')}") do
      unless VCR.current_cassette.recording?
        Aws::CredentialProviderChain.
            any_instance.
            stubs(:static_credentials).
            returns(Aws::Credentials.new('test_aws_key', 'test_aws_secret'))
      end
      PEGASUS_DB.transaction(rollback: :always) do
        AWS::S3.stub(:random, proc {random.bytes(16).unpack('H*')[0]}, &block)
      end
    end
    # Reset AUTO_INCREMENT, since it is unaffected by transaction rollback.
    TEST_TABLES.each do |table|
      PEGASUS_DB.execute("ALTER TABLE `#{table}` AUTO_INCREMENT = 1")
    end
  end
end
