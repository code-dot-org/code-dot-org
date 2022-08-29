class ContinuousIntegrationProductionEnvironment < ContinuousIntegrationEnvironment
  def notify_success
    if rack_env == :production
      ChatClient.message 'server operations', message, color: 'green'
      ChatClient.message 'server operations', commit_url, color: 'gray', message_format: 'text'
      DevelopersTopic.set_dtp 'yes'
      InfraProductionTopic.set_dtp_commit GitHub.sha('production')

      # Schedule a reminder for the dotd to check Zendesk in 2 hours
      Slack.remind(Slack.user_id(DevelopersTopic.dotd), Time.now.to_i + 7200, 'Reminder: check <https://codeorg.zendesk.com/agent/filters/44863373|Zendesk>')

      # Check hoc_mode and hoc_launch only on successful DTPs, so that we get about 1 reminder per
      # day to bring staging, test and production to the same hoc_mode and hoc_launch after a
      # hoc_mode or hoc_launch change. Note that this will only warn us if test and production
      # (but not staging) are out of sync.
      check_hoc_mode
      check_hoc_launch
    end
  end
end

private

def check_hoc_mode
  hoc_mode = DCDO.get('hoc_mode', false)
  if hoc_mode != CDO.default_hoc_mode
    # The test machine cannot remember DCDO params, so its hoc_mode is controlled by
    # CDO.default_hoc_mode.
    msg = "<!here> #{rack_env} hoc_mode (#{hoc_mode.inspect}) and default_hoc_mode "\
      "(#{CDO.default_hoc_mode.inspect}) are out of sync. Please update CDO.default_hoc_mode in "\
      "github, DCDO hoc_mode in staging, and DCDO hoc_mode in production to the same values, so "\
      "that our staging, test and production environments all show the same version of our site."
    ChatClient.log msg
  end
end

def check_hoc_launch
  hoc_launch = DCDO.get('hoc_launch', false)
  if hoc_launch != CDO.default_hoc_launch
    # The test machine cannot remember DCDO params, so its hoc_launch is controlled by
    # CDO.default_hoc_launch.
    msg = "<!here> #{rack_env} hoc_launch (#{hoc_launch.inspect}) and default_hoc_launch "\
      "(#{CDO.default_hoc_launch.inspect}) are out of sync. Please update CDO.default_hoc_launch in "\
      "github, DCDO hoc_launch in staging, and DCDO hoc_launch in production to the same values, so "\
      "that our staging, test and production environments all show the same version of our site."
    ChatClient.log msg
  end
end
