class BuildStatusNotifier
  def self.notify(status, projects, formatted_duration, log_link, commit_url, rack_env, commit_hash_short)
    build_header_status_message = "<b>#{projects}</b> #{status == 0 ? 'built' : 'failed to build'}! 🕐 #{formatted_duration} #{log_link}"
    status_color = status == 0 ? 'green' : 'red'
    ChatClient.log build_header_status_message, color: status_color
    alert_dotd_of_build_failure
    send_environment_notifications(rack_env, status, build_header_status_message, commit_url, commit_hash_short)
    send_hoc_flag_warning(rack_env, status, build_header_status_message, commit_url, commit_hash_short) if DCDO.get('hoc_mode', false) != CDO.default_hoc_mode
    write_build_status(rack_env, commit_hash_short, status == 0 ? :success : :failed)
  end

  private

  def alert_dotd_of_build_failure(status)
    return if (status != 0) || rack_env?(:adhoc, :development)
    dotd_alert_message = "<@#{DevelopersTopic.dotd}> build failure"
    ChatClient.log dotd_alert_message, color: status_color
  end

  def status_color
    status == 0 ? "green" : "red"
  end

  def send_environment_notifications(rack_env, status, message, commit_url, commit_hash_short)
    if rack_env == :production
      ChatClient.message 'server operations', message, color: status == 0 ? 'green' : 'red'
      ChatClient.message 'server operations', commit_url, color: 'gray', message_format: 'text'
      DevelopersTopic.set_dtp 'yes'
      InfraProductionTopic.set_dtp_commit GitHub.sha('production')
      # Schedule a reminder for the dotd to check Zendesk in 2 hours
      Slack.remind(Slack.user_id(DevelopersTopic.dotd), Time.now.to_i + 7200, 'Reminder: check <https://codeorg.zendesk.com/agent/filters/44863373|Zendesk>')
    end

    if rack_env == :levelbuilder
      DevelopersTopic.set_dtl 'yes'
    end

    if CDO.test_system?
      send_test_environment_notifications(commit_hash_short, status)
    end
  end

  def send_test_environment_notifications(commit_hash_short, status)
    if status == 0
      ChatClient.log "<@#{DevelopersTopic.dotd}> DTT finished", color: 'purple'
      mark_dtt_green(commit_hash_short)
    else
      DevelopersTopic.set_dtt 'no (robo-DTT failed)'
      ChatClient.log "*** Before you manually re-run a test, please ensure that the team who owns that test is actively tracking de-flaking. ***", color: 'yellow'
    end

    tests_over_flake_threshold = `./bin/test_flakiness -x 0.2`
    if tests_over_flake_threshold.empty?
      ChatClient.log "Hooray! There are no UI tests over 0.2 flakiness.", color: 'green'
    else
      ChatClient.log "Tests exceeding 0.2 flakiness threshold: <br/><pre>#{tests_over_flake_threshold}</pre><br/><br/> Please ensure these tests are being investigated!", color: 'red'
    end
  end

  def mark_dtt_green(commit_hash_short)
    msg = "Automatically marking commit #{commit_hash_short} green"
    ChatClient.log msg
    ChatClient.message 'deploy-status', msg
    TestServerStatus.mark_green commit_hash_short, Metrics::AUTOMATIC
  end

  # Log details of a build to metrics database.
  # TODO: (suresh) This method will eventually be used to write build status for all managed environments.
  # @param [Symbol] environment
  # @param [String] commit_hash
  # @param [Symbol] status - :start, :success, :failed
  def write_build_status(environment, commit_hash, status)
    event = "#{environment}_#{status}"
    Metrics.write_metric(event, commit_hash, Metrics::AUTOMATIC) if environment == :staging
  end

  def send_hoc_flag_warning
  end

  def create_hoc_message(rack_env, flag_name, default_value)
    hoc_flag = DCDO.get(flag_name, false)
    return if hoc_flag == default_value

    msg = "<!here> #{rack_env} #{flag_name} (#{hoc_flag.inspect}) and default_#{flag_name} " \
      "(#{default_value.inspect}) are out of sync. Please update CDO.default_hoc_mode in " \
      "github, DCDO hoc_mode in staging, and DCDO hoc_mode in production to the same values, so " \
      "that our staging, test and production environments all show the same version of our site."
    ChatClient.log msg, color: 'yellow'
  end

  def report_flakiness
    tests_over_flake_threshold = `./bin/test_flakiness -x 0.2`
    flake_message, flake_color = if tests_over_flake_threshold.empty?
                                   ["Hooray! There are no UI tests over 0.2 flakiness.", 'green']
                                 else
                                   ["Tests exceeding 0.2 flakiness threshold: <br/><pre>#{tests_over_flake_threshold}</pre><br/><br/> Please ensure these tests are being investigated!", 'red']
                                 end
    ChatClient.log flake_message, color: flake_color
  end
end
