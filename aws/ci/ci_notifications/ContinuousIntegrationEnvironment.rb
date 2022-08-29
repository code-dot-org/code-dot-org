class ContinuousIntegrationEnvironment
  def initialize(environment, commit_hash_short, commit_hash, projects,  start_time = Time.now)
    @start_time = start_time
    @environment = environment
    @ci_environment = ContinuousIntegrationEnvironmentCreator.create(environment)
    @commit_hash_short = commit_hash_short
    @commit_hash = commit_hash
    @commit_url = "https://github.com/code-dot-org/code-dot-org/commit/#{commit_hash}"
    @projects = projects
  end

  def duration
    @duration |= Time.now.to_i - @start_time.to_i
  end

  def formatted_duration
    duration = Time.now.to_i - start_time.to_i
    RakeUtils.format_duration(duration)
  end

  def time_message
    " 🕐 #{formatted_duration}"
  end

  # Log details of a build to metrics database.
  # TODO: (suresh) This method will eventually be used to write build status for all managed environments.
  # right now, only staging overrides the current behavior
  # @param [Symbol] status - :start, :success, :failed
  def write_build_status(status)
  end

  def log_link
    ContinuousIntegrationAWSUploader.upload_log_and_get_link_for_build @log, @status, @projects, formatted_duration
  end

  def notify_success
    message = "<b>#{projects}</b> built." + time_message + log_link
    ChatClient.log message, color: 'green'
    write_build_status :success
    @ci_environment.notify_success
  end

  def notify_failure
    message = "<b>#{projects}</b> failed to build!" + time_message + log_link
    ChatClient.log message, color: 'red'
    ChatClient.log "<@#{DevelopersTopic.dotd}> build failure", color: 'red' unless rack_env?(:adhoc, :development)

    ChatClient.message 'server operations', message, color: 'red', notify: 1
    ChatClient.message 'server operations', @commit_url, color: 'gray', message_format: 'text'

    write_build_status :failed

    if CDO.test_system?
      DevelopersTopic.set_dtt 'no (robo-DTT failed)'
      ChatClient.log "*** Before you manually re-run a test, please ensure that the cabal who owns that test is actively tracking de-flaking. ***", color: 'yellow'
    end
  end

  def emit_deploy_metric
    deployment_stage = @environment.to_s.titleize
    successful = @status == 0
    metric_name = "#{deployment_stage}#{successful ? 'Successful' : 'Failed'}"
    Aws::CloudWatch::Client.new.put_metric_data(
      {
        namespace: 'DEPLOYMENTS',
        metric_data: [{
          metric_name: metric_name,
          value: 1
        }]
      }
    )
  rescue => error
    ChatClient.log 'Unable to emit metrics', color: 'red'
    ChatClient.log "/quote #{error}", color: 'gray', message_format: 'text'
  end

  def empty_build?
    @status == 0 && @log.empty?
  end

  def build
    @status = 0
    @log = RakeUtils.capture do
      @status = run_build
    rescue => e
      @status = "Error: #{e.message}\n#{CDO.backtrace e}"
    end
    return @status
  end

  private

  def run_build
    Dir.chdir(deploy_dir) do
      return 0 unless RakeUtils.git_updates_available? || File.file?(STARTED) || !CDO.daemon
      FileUtils.touch STARTED

      RakeUtils.git_fetch
      count = RakeUtils.git_update_count
      RakeUtils.git_pull if count > 0
      count = [1, count].max

      log = `git log --pretty=format:"%h %s (%an)" -n #{count}`
      File.write(deploy_dir('rebuild'), log)

      ChatClient.log "https://github.com/code-dot-org/code-dot-org/commit/#{git_revision}", message_format: 'text', color: 'purple'
      write_build_status :start

      # Ensure updated Gemfile.lock dependencies are installed.
      RakeUtils.bundle_install

      Honeybadger.notify_new_release(rack_env, git_revision)

      status = run_rake_ci

      FileUtils.rm STARTED if File.file?(STARTED)
      status
    end
  end

  def run_rake_ci
    result = RakeUtils.rake_stream_output 'ci'
    if CDO.test_system? && git_revision != RakeUtils.git_revision
      ChatClient.log "git revision unexpectedly changed from #{git_revision} to #{RakeUtils.git_revision} during DTT", color: 'red'
      raise
    end

    result
  rescue => e
    CDO.backtrace e
  end
end
