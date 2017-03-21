require_relative '../../deployment'
require 'cdo/slack'

module DevelopersTopic
  BRANCHES = [
    STAGING = 'staging'.freeze,
    TEST = 'test'.freeze,
    PRODUCTION = 'production'.freeze
  ].freeze

  # @return [Boolean] Whether DTS is yes.
  def self.dts?
    branch_open_for_merge? STAGING
  end

  # @return [Boolean] Whether DTT is yes.
  def self.dtt?
    branch_open_for_merge? TEST
  end

  # @return [Boolean] Whether DTP is yes.
  def self.dtp?
    branch_open_for_merge? PRODUCTION
  end

  # @return [String] The DTS portion of the room topic.
  def self.dts
    branch_message STAGING
  end

  # @return [String] The DTT portion of the room topic.
  def self.dtt
    branch_message TEST
  end

  # @return [String] The DTP portion of the room topic.
  def self.dtp
    branch_message PRODUCTION
  end

  # @param new_subtopic [String] The string to which DTS should be set.
  def self.set_dts(message)
    set_branch_message STAGING, message
  end

  # @param message [String] The string to which DTT should be set.
  def self.set_dtt(message)
    set_branch_message TEST, message
  end

  # @param message [String] The string to which DTP should be set.
  def self.set_dtp(message)
    set_branch_message PRODUCTION, message
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @raise [ArgumentError] If the branch is none of the allowed options.
  # @return [String] Either 'DTS', 'DTT', 'DTP', as appropriate.
  private_class_method def self.branch_prefix(branch)
    case branch
    when STAGING
      return 'DTS: '
    when TEST
      return 'DTT: '
    when PRODUCTION
      return 'DTP: '
    end
    raise "Unknown branch #{branch}"
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @return [Boolean] Whether the specified branch is open for merges.
  private_class_method def self.branch_open_for_merge?(branch)
    current_topic = Slack.get_topic('developers')
    prefix = branch_prefix(branch)
    current_topic.include? "#{prefix}yes"
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @return [String] The portion of the room topic pertaining to branch.
  private_class_method def self.branch_message(branch)
    prefix = branch_prefix branch
    current_topic = Slack.get_topic 'developers'
    raise unless current_topic.include? prefix
    start_index = current_topic.index prefix
    end_index = current_topic.index(';', start_index) || current_topic.length
    current_topic[(start_index + prefix.length)...end_index]
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @param message [String] The string to which the branch message should be
  #   set.
  private_class_method def self.set_branch_message(branch, message)
    prefix = branch_prefix branch
    current_topic = Slack.get_topic 'developers'
    old_message = branch_message(branch)
    new_topic = current_topic.gsub "#{prefix}#{old_message}", "#{prefix}#{message}"
    Slack.update_topic 'developers', new_topic
  end
end
