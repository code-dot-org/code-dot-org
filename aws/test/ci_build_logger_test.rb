require_relative '../../shared/test/test_helper'

require_relative '../ci_build_logger' # Adjust the path as necessary

class CiBuildLoggerTest < Minitest::Test
  def setup
    @aws_client = mock('aws_client')
    @ci_build_logger = CiBuildLogger.new(aws_client: @aws_client)
    @log_key = '20230101T120000+0000'
    @log_content = 'Test log content'
    @metadata = {commit: 'abc123', duration: '30s', success: 'true'}
    @s3_url = "https://s3.console.aws.amazon.com/s3/object/#{CiBuildLogger::S3_LOGS_BUCKET}/#{CiBuildLogger::S3_LOGS_PREFIX}/#{@log_key}"
  end

  def test_upload_log_and_get_link_success
    @aws_client.expects(:put_object).with(
      bucket: CiBuildLogger::S3_LOGS_BUCKET,
      key: "#{CiBuildLogger::S3_LOGS_PREFIX}/#{@log_key}",
      body: @log_content,
      metadata: @metadata
    ).returns(nil) # Mock the successful upload

    AWS::S3.expects(:get_console_link_from_presigned).with(@s3_url).returns('permalink')

    result = @ci_build_logger.upload_log_and_get_link(@log_key, @log_content, @metadata)
    assert_match @s3_url, result
  end

  def test_upload_log_and_get_link_failure
    @aws_client.expects(:put_object).raises(StandardError.new('S3 upload failed'))
    ChatClient.expects(:log).with(regexp_matches(/Uploading log to S3 failed/)).once
    result = @ci_build_logger.upload_log_and_get_link(@log_key, @log_content, @metadata)
    assert result.nil?
  end
end
