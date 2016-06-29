# Common settings Shared Rake test.

ENV['RACK_ENV'] = 'test'

require 'minitest/autorun'
require 'rack/test'
require 'minitest/reporters'
require 'minitest/around/unit'
require 'webmock'
require 'vcr'
require_relative '../../deployment'
require 'cdo/db'
require 'cdo/aws/s3'

raise 'Test helper must only be used in `test` environment!' unless rack_env? :test

Minitest::Reporters.use! Minitest::Reporters::SpecReporter.new
WebMock.disable_net_connect!

VCR.configure do |c|
  c.cassette_library_dir = File.expand_path 'fixtures/vcr', __dir__
  c.hook_into :webmock
  # Filter unnecessary headers from the http interactions.
  c.before_record do |i|
    %w(
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
TEST_TABLES=%w(storage_apps user_storage_ids).freeze
TEST_TABLES.each do |table|
  PEGASUS_DB[table.to_sym].truncate
end

module SetupTest
  def around(&block)
    random = Random.new(0)
    ENV['AWS_ACCESS_KEY_ID'] ||= 'test_aws_key'
    ENV['AWS_SECRET_ACCESS_KEY'] ||= 'test_aws_secret'

    # 3 test wrappers:
    # VCR (record/replay HTTP interactions)
    # Transaction rollback (leave behind no database side-effects)
    # Stub AWS::S3#random
    VCR.use_cassette("#{self.class.to_s.chomp('Test').downcase}/#{@NAME.gsub('test_','')}") do
      PEGASUS_DB.transaction(rollback: :always) do
        AWS::S3.stub(:random,Proc.new{random.bytes(16).unpack('H*')[0]}, &block)
      end
    end
    # Reset AUTO_INCREMENT, since it is unaffected by transaction rollback.
    TEST_TABLES.each do |table|
      PEGASUS_DB.execute("ALTER TABLE `#{table}` AUTO_INCREMENT = 1")
    end
  end
end
