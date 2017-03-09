require_relative '../../deployment'
require 'cdo/slack'

module DevelopersTopic
  BRANCHES = [
    STAGING = 'staging'.freeze,
    TEST = 'test'.freeze,
    PRODUCTION = 'production'.freeze
  ].freeze

  # @return [Boolean] Whether the DTS subtopic indicates DTS is yes.
  def self.dts?
    branch_open_for_merge? STAGING
  end

  # @return [Boolean] Whether the DTT subtopic indicates DTT is yes.
  def self.dtt?
    branch_open_for_merge? TEST
  end

  # @return [Boolean] Whether the DTP subtopic indicates DTP is yes.
  def self.dtp?
    branch_open_for_merge? PRODUCTION
  end

  # @return [String] The DTS subtopic.
  def self.dts_subtopic
    branch_subtopic STAGING
  end

  # @return [String] The DTT subtopic.
  def self.dtt_subtopic
    branch_subtopic TEST
  end

  # @return [String] The DTP subtopic.
  def self.dtp_subtopic
    branch_subtopic PRODUCTION
  end

  # @param new_subtopic [String] The subtopic to set DTS to.
  def self.set_dts_subtopic(new_subtopic)
    set_branch_subtopic STAGING, new_subtopic
  end

  # @param new_subtopic [String] The subtopic to set DTT to.
  def self.set_dtt_subtopic(new_subtopic)
    set_branch_subtopic TEST, new_subtopic
  end

  # @param new_subtopic [String] The subtopic to set DTP to.
  def self.set_dtp_subtopic(new_subtopic)
    set_branch_subtopic PRODUCTION, new_subtopic
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @raise [ArgumentError] If the branch is none of the allowed options.
  # @return [String] The prefix of the associated subtopic.
  private_class_method def self.branch_subtopic_prefix(branch)
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
    subtopic_prefix = branch_subtopic_prefix(branch)
    current_topic.include? "#{subtopic_prefix}yes"
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @return [String] The subtopic associated with the specified branch.
  private_class_method def self.branch_subtopic(branch)
    subtopic_prefix = branch_subtopic_prefix branch
    current_topic = Slack.get_topic 'developers'
    raise unless current_topic.include? subtopic_prefix
    start_index = current_topic.index subtopic_prefix
    end_index = current_topic.index(';', start_index) || current_topic.length
    current_topic[(start_index + subtopic_prefix.length)...end_index]
  end

  # @param branch [String] One of 'staging', 'test', 'production'.
  # @param new_subtopic [String] The subtopic to associate with the specified
  #   branch.
  private_class_method def self.set_branch_subtopic(branch, new_subtopic)
    subtopic_prefix = branch_subtopic_prefix branch
    current_topic = Slack.get_topic 'developers'
    branch_subtopic = branch_subtopic(branch)
    new_topic = current_topic.gsub "#{subtopic_prefix}#{branch_subtopic}", "#{subtopic_prefix}#{new_subtopic}"
    Slack.set_topic 'developers', new_topic
  end
end
