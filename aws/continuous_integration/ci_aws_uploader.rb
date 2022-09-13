class CIAWSUploader
  S3_LOGS_BUCKET = 'cdo-build-logs'.freeze
  S3_LOGS_PREFIX = CDO.name.freeze

  def self.upload_log_and_get_link_for_build(log, status, projects, start_time, duration, commit_hash)
    key, body, metadata = get_aws_metrics_info(log, status, projects, start_time, duration, commit_hash)
    puts "-----"
    puts key
    puts "-----"
    puts body
    puts "-----"
    puts metadata
    puts "-----"
    upload_and_get_link(key, body, metadata)
  end

  def self.get_aws_metrics_info(log, status, projects, start_time, duration, commit_hash)
    formatted_duration = RakeUtils.format_duration(duration)
    key = start_time.strftime('%Y%m%dT%H%M%S%z')
    body = <<~LOG
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
  def self.upload_and_get_link(key, body, metadata)
    log_url = AWS::S3::LogUploader.
      new(S3_LOGS_BUCKET, S3_LOGS_PREFIX).
      upload_log(
        key,
        body,
        {metadata: metadata}
      )
    return " <a href='#{log_url}'>☁ Log on S3</a>"
  rescue Exception => msg
    puts "wtf"
    puts msg
    ChatClient.log "Uploading log to S3 failed: #{msg}"
    return ''
  end
end
