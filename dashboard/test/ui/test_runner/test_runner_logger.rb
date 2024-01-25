class TestRunnerLogger
  attr_reader :local_log_directory, :verbose, :upload_html_logs
  attr_accessor :success_log, :error_log, :errorbrowsers_log

  def initialize(local_log_directory, verbose, upload_html_logs)
    @local_log_directory = local_log_directory
    @verbose = verbose
    @upload_html_logs = upload_html_logs
    FileUtils.mkdir_p(local_log_directory)
  end

  def open_log_files
    @success_log = File.open(File.join(local_log_directory, "success.log"), 'w')
    @error_log = File.open(File.join(local_log_directory, "error.log"), 'w')
    @error_browsers_log = File.open(File.join(local_log_directory, "errorbrowsers.log"), 'w')
  end

  def close_log_files
    @success_log&.close
    @error_log&.close
    @error_browsers_log&.close
  end

  def log_success(message)
    write_message(@success_log, message)
  end

  def log_error(message)
    write_message(@error_log, message)
  end

  def log_browser_error(message)
    write_message(@error_browsers_log, message)
  end

  def write_message(stream, message)
    stream.puts message
    puts message if @verbose
  end

  # Upload the given log to the cucumber-logs s3 bucket.
  # @param [String] filename of log file to be uploaded.
  # @return [String] a public hyperlink to the uploaded log, or empty string.
  def log_html_report_in_s3(filename, metadata)
    return '' unless
    # Assume all log files are Cucumber reports in html format.
    # TODO: Set content type dynamically based on filename extension.
    log_url = LOG_UPLOADER.upload_file(filename, {content_type: 'text/html', metadata: metadata})
    " <a href='#{log_url}'>☁ Log on S3</a>"
  rescue Exception => exception
    ChatClient.log "Uploading log to S3 failed: #{exception}"
    return ''
  end
end
