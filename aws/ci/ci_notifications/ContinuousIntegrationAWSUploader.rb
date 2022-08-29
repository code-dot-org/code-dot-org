class ContinuousIntegrationAWSUploader
  S3_LOGS_BUCKET = 'cdo-build-logs'.freeze
  S3_LOGS_PREFIX = CDO.name.freeze

  def self.upload_log_and_get_link_for_build(log, status, projects, formatted_duration)
    key, body, metadata = get_aws_metrics_info(log, status, projects, formatted_duration)
    upload_log_and_get_link(key, body, metadata)
  end

  private

  def get_aws_metrics_info(log, status, projects, formatted_duration)
    key =   start_time.strftime('%Y%m%dT%H%M%S%z')
    body = <<~LOG,
      #{log}
      #{status}
      #{projects} #{status == 0 ? 'built' : 'failed'} in #{formatted_duration}
    LOG

           metadata = {
             commit: commit_hash,
             duration: duration.to_s,
             success: (status == 0).to_s
           }
    return key, body, metadata
  end

  # Upload the given log to the logs s3 bucket.
  # @param [String] key where uploaded log should be located
  # @param [String] body of log to upload
  # @param [Hash] metadata to be attached to uploaded log
  # @return [String] Hyperlink to uploaded log, or empty string
  def upload_and_get_link(key, body, metadata)
    log_url = AWS::S3::LogUploader.
      new(S3_LOGS_BUCKET, S3_LOGS_PREFIX).
      upload_log(
        key,
        body,
        {metadata: metadata}
      )
    " <a href='#{log_url}'>☁ Log on S3</a>"
  rescue Exception => msg
    ChatClient.log "Uploading log to S3 failed: #{msg}"
    return ''
  end
end
