require 'aws-sdk-s3'

class CiBuildLogger
  S3_LOGS_BUCKET = 'cdo-build-logs'.freeze
  S3_LOGS_PREFIX = CDO.name.freeze

  def initialize(aws_client: Aws::S3::Client.new)
    @s3_client = aws_client
  end

  # Upload the given log to the logs s3 bucket.
  # @param [String] key where uploaded log should be located
  # @param [String] body of log to upload
  # @param [Hash] metadata to be attached to uploaded log
  # @return [String] Hyperlink to uploaded log, or empty string
  def log_build_end(start_time, body, metadata)
    log_url = AWS::S3::LogUploader.
      new(S3_LOGS_BUCKET, S3_LOGS_PREFIX).
      upload_log(
        generate_log_key(start_time),
        body,
        {metadata: metadata}
      )
    permalink = AWS::S3.get_console_link_from_presigned(log_url)
    "<a href='#{log_url}'>☁ Log on S3</a> (<a href='#{permalink}'>permalink</a>)"
  rescue Exception => exception
    ChatClient.log "Uploading log to S3 failed: #{exception}"
    return ''
  end

  private

  def generate_log_key(timestamp)
    timestamp.strftime('%Y%m%dT%H%M%S%z')
  end
end
