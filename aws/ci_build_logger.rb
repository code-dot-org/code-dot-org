require 'aws-sdk-s3'

class CiBuildLogger
  S3_LOGS_BUCKET = 'cdo-build-logs'.freeze
  S3_LOGS_PREFIX = CDO.name.freeze

  def initialize(aws_client: Aws::S3::Client.new)
    @s3_client = aws_client
  end

  def log_build_end(status, log, metadata)
    upload_log_and_get_link(generate_log_key, log, metadata)
  end

  def upload_log_and_get_link(key, body, metadata)
    log_url = upload_log_to_s3(key, body, metadata)
    permalink = AWS::S3.get_console_link_from_presigned(log_url)
    " <a href='#{log_url}'>☁ Log on S3</a> (<a href='#{permalink}'>permalink</a>)"
  rescue StandardError => exception
    ChatClient.log "Uploading log to S3 failed: #{exception}"
  end

  private

  def generate_log_key
    Time.now.strftime('%Y%m%dT%H%M%S%z')
  end

  def upload_log_to_s3(key, body, metadata)
    @s3_client.put_object(
      bucket: S3_LOGS_BUCKET,
      key: "#{S3_LOGS_PREFIX}/#{key}",
      body: body,
      metadata: metadata
    )
    "https://s3.console.aws.amazon.com/s3/object/#{S3_LOGS_BUCKET}/#{S3_LOGS_PREFIX}/#{key}"
  end
end
