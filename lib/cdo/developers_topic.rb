require_relative '../../deployment'
require 'cdo/slack'

module DevelopersTopic
  BRANCH_PREFIXES = {
    staging: 'DTS: ',
    test: 'DTT: ',
    production: 'DTP: ',
    levelbuilder: 'DTL: '
  }.freeze

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

  # @return [Boolean] Whether DTL is yes.
  def self.dtl?
    branch_open_for_merge? LEVELBUILDER
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

  # @return [String] The DTL portion of the room topic.
  def self.dtl
    branch_message LEVELBUILDER
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

  # @param message [String] The string to which DTL should be set.
  def self.set_dtl(message)
    set_branch_message LEVELBUILDER, message
  end

  # @return [Boolean] Whether the specified branch is open for merges.
  private_class_method def self.branch_open_for_merge?(branch)
    current_topic = Slack.get_topic('developers')
    prefix = BRANCH_PREFIX[branch.to_sym]
    current_topic.include? "#{prefix}yes"
  end

  # @param branch [String] One of 'staging', 'test', 'production', 'levelbuilder'.
  # @return [String] The portion of the room topic pertaining to branch.
  private_class_method def self.branch_message(branch)
    prefix = BRANCH_PREFIX[branch.to_sym]
    current_topic = Slack.get_topic 'developers'
    raise unless current_topic.include? prefix
    start_index = current_topic.index prefix
    end_index = current_topic.index(';', start_index) || current_topic.length
    current_topic[(start_index + prefix.length)...end_index]
  end

  # @param branch [String] One of 'staging', 'test', 'production', 'levelbuilder'.
  # @param message [String] The string to which the branch message should be
  #   set.
  private_class_method def self.set_branch_message(branch, message)
    prefix = BRANCH_PREFIX[branch.to_sym]
    current_topic = Slack.get_topic 'developers'
    old_message = branch_message(branch)
    new_topic = current_topic.gsub "#{prefix}#{old_message}", "#{prefix}#{message}"
    Slack.update_topic 'developers', new_topic
  end
end
