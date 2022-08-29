class ContinuousIntegrationLevelBuilderEnvironmentNotifications < ContinuousIntegrationEnvironmentNotifications
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
