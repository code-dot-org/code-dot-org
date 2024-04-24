require_relative './developers_topic'
require_relative './infra_test_topic'

module TestServerStatus
  # Notes that a new DTT has started, updating Slack topics to set "DTT: no"
  # and recording relevant metrics.
  def self.mark_started(sha)
    DevelopersTopic.set_dtt 'no (manual DTT in progress)'
  end

  # Marks the most recent DTT green, updating Slack #infra-test and
  # #deploy-status topics appropriately.
  def self.mark_green(sha)
    DevelopersTopic.set_dtt 'yes'
    InfraTestTopic.set_green_commit sha
  end

  # Marks the most recent DTT red, updating the Slack #deploy-status topic to
  # allow a new test run, and sends a message to #infra-test reporting the red
  # outcome but leaves the topic alone so it continues to represent the most
  # recent green run.
  def self.mark_red(sha)
    DevelopersTopic.set_dtt 'yes'
    InfraTestTopic.set_red_commit sha
  end
end
