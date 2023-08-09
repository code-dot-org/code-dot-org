#!/usr/bin/env ruby

# rubocop:disable all

#
#
#
#
#
#
#
#
# how about you go look at the adhoc rake test and lib/cdo/aws modules
#
#
#
#
#
#
#

require_relative 'only_one'
require_relative '../../deployment'
require 'aws-sdk-ec2'
require 'aws-sdk-cloudformation'
require 'cdo/chat_client'

class CleanupAdhocEnvironments
  ADHOC_STOPPED_AT = 'adhoc_stopped_at'.freeze

  attr_reader :dry_run

  def initialize(dry_run: !rack_env?(:production))
    @dry_run = dry_run
    log "Running in #{dry_run ? 'dry-run' : 'production'} mode."
  end

  def run
    tag_previously_stopped_adhocs
    stop_running_adhoc_instances
    delete_stale_adhoc_stacks
    log_error_stacks
  end

  # First, tag any adhoc instances that were previously stopped.
  # This function can be removed once we've tagged the existing adhoc backlog.
  def tag_previously_stopped_adhocs
    adhocs_to_tag = get_adhoc_instances.select do |instance|
      # Instance must be in a stopped state
      next false unless instance.state.name == 'stopped'
      # Instance must not have been already tagged with the stopped_at tag
      next false if instance.tags.any? {|tag| tag.key == ADHOC_STOPPED_AT}
      # Instance must not have termination protection enabled
      next false if instance.describe_attribute(attribute: 'disableApiTermination').disable_api_termination.value

      true
    end

    return if adhocs_to_tag.empty?

    log "Tagging #{adhocs_to_tag.length} adhoc instances:\n" +
      adhocs_to_tag.map {|a| a.tags.detect {|t| t.key == 'Name'}&.value}.join("\n")

    tag_stopped_instances(adhocs_to_tag) unless $dry_run
  end

  # Stop (shut down) all running adhoc EC2 instances to save on costs.
  # Engineers can re-launch the instance as needed, or enable termination protection to keep the instance running.
  def stop_running_adhoc_instances
    adhocs_to_stop = get_adhoc_instances.select do |instance|
      # Instance must be in a running state
      next false unless instance.state.name == 'running'
      # Instance must not have termination production enabled
      next false if instance.describe_attribute(attribute: 'disableApiTermination').disable_api_termination.value

      true
    end

    return if adhocs_to_stop.empty?

    log "Stopping #{adhocs_to_stop.length} adhoc instances:\n" +
      adhocs_to_stop.map {|a| a.tags.detect {|t| t.key == 'Name'}&.value}.join("\n")

    Aws::EC2::Instance::Collection.new([adhocs_to_stop]).batch_stop(dry_run: $dry_run)

    tag_stopped_instances(adhocs) unless $dry_run
  end

  def delete_stale_adhoc_stacks
    # cloudformation = Aws::CloudFormation::Client.new

    # stacks_to_delete = get_adhoc_instances.select do |instance|
      # # Instance must be in a stopped state
      # next false unless instance.state.name == 'stopped'

      # # Instance must have been stopped by this script at least 6 days ago
      # stopped_at_tag = instance.tags.find {|tag| tag.key == ADHOC_STOPPED_AT}
      # next false if stopped_at_tag.nil?
      # stopped_at = DateTime.parse(stopped_at_tag.value)
      # next false unless more_than_six_days_ago?(stopped_at)
  
      # # Instance must not have termination production enabled
      # next false if instance.describe_attribute(attribute: 'disableApiTermination').disable_api_termination.value
  
      # # Instance must have an identifiable stack name
      # stack_name = instance.tags.find {|tag| tag.key == 'aws:cloudformation:stack-name'}&.value
      # next false if stack_name.nil?
  
      # # Don't delete one of the critical stacks
      # critical_stacks = %w[autoscale-prod test staging levelbuilder adhoc-bugcrowd]
      # raise "Critical stack #{stack_name} incorrectly identified for deletion!" if critical_stacks.include?(stack_name)

      true
    end
  
    # return if stacks_to_delete.empty?
  
    # log "Deleting #{stacks_to_delete.length} adhoc CloudFormation Stacks:\n" + stacks_to_delete.join("\n")
  
    # stacks_to_delete.each {|stack_name| cloudformation.delete_stack(stack_name: stack_name)} unless $dry_run
  end

  # Utility Functions

  # Returns a collection of adhoc web server instances
  def get_adhoc_instances
    filters = {
      'tag:environment' => 'adhoc',
      'tag:aws:cloudformation:logical-id' => 'WebServer'
    }.map {|k, v| {name: k, values: [v]}}

    instances = Aws::EC2::Resource.new.instances(filters: filters).select do |instance|
      # reject if the instance does not have 'adhoc' as it's 'environment' tag
      instance.tags.any? {|tag| tag.key == 'environment' && tag.value == 'adhoc'}
    end

    return instances
    # Aws::EC2::Instance::Collection.new([instances])
  end

  # Tag instances with the current time
  def tag_stopped_instances(instances)
    instances.each do |instance|
      instance.create_tags({tags: [{key: ADHOC_STOPPED_AT, value: Time.now.to_s}]})
    end
  end

end

# Only run the class if this file is called directly
if __FILE__ == $0
  abort 'Script already running' unless only_one_running?(__FILE__)
  CleanupAdhocEnvironments.new.run
end

# Old Stuff

# Log any adhoc stacks in an error state
def log_error_stacks
  error_states = ['CREATE_FAILED', 'ROLLBACK_FAILED', 'DELETE_FAILED', 'UPDATE_ROLLBACK_FAILED']

  cloudformation = Aws::CloudFormation::Client.new
  stacks_in_error = cloudformation.describe_stacks.stacks.select do |stack|
    error_states.include?(stack.stack_status) && stack.stack_name.include?('adhoc')
  end

  if stacks_in_error.any?
    log "@infra-team, the following adhoc CloudFormation stacks are in an error state:\n" +
      stacks_in_error.map {|stack| "#{stack.stack_name} (#{stack.stack_status})"}.join("\n")
  end
end

# Utility Functions
# -----------------

# Returns true if the given time is more than six days ago
def more_than_six_days_ago?(time)
  seconds_in_a_day = 24 * 60 * 60
  (Time.now - time) > 6 * seconds_in_a_day
end

# Log a message to the console and chat
def log(msg)
  puts msg
  ChatClient.message('adhoc', msg) unless $dry_run
end

# Call the functions
# tag_previously_stopped_adhocs
# stop_running_adhoc_instances
# delete_stale_adhoc_stacks
# log_error_stacks
