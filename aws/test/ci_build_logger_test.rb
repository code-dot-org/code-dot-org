require_relative '../../shared/test/test_helper'

require_relative '../ci_build_logger' # Adjust the path as necessary

class CiBuildLoggerTest < Minitest::Test
  def setup
    @s3_client = mock('Aws::S3::Client')
    @log_uploader = mock('AWS::S3::LogUploader')
    AWS::S3::LogUploader.stubs(:new).returns(@log_uploader)
    @ci_build_logger = CiBuildLogger.new(aws_client: @s3_client)
    @log_key = '20230101T120000+0000'
    @log_key_time = Time.strptime(@log_key, '%Y%m%dT%H%M%S%z')
    @log_content = 'Test log content'
    @metadata = {commit: 'abc123', duration: '30s', success: 'true'}
    @log_url = "https://s3.console.aws.amazon.com/s3/object/#{CiBuildLogger::S3_LOGS_BUCKET}/#{CiBuildLogger::S3_LOGS_PREFIX}/#{@log_key}"
    @permalink = "https://example.com/permalink"
  end

  def test_upload_log_and_get_link_success
    @log_uploader.expects(:upload_log).with(
      @log_key,
      @log_content,
      metadata: @metadata
    ).returns(@log_url)

    AWS::S3.expects(:get_console_link_from_presigned).with(@log_url).returns(@permalink)
    result = @ci_build_logger.log_build_end(@log_key_time, @log_content, @metadata)

    expected_result = "<a href='#{@log_url}'>☁ Log on S3</a> (<a href='#{@permalink}'>permalink</a>)"
    assert_equal expected_result, result
  end

  def test_upload_log_and_get_link_failure
    @log_uploader.expects(:upload_log).raises(StandardError.new('S3 upload failed'))

    ChatClient.expects(:log).with("Uploading log to S3 failed: S3 upload failed")
    result = @ci_build_logger.log_build_end(@log_key_time, @log_content, @metadata)

    assert_empty result
  end
end
