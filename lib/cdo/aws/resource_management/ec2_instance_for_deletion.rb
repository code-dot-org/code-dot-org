# Class used to control the deletion process of an EC2 instance
# This class provides reusable methods that evaluate if an ec2 instance can be deleted
# and methods to delete such an instance
class EC2InstanceForDeletion
  DISABLED_API_TERMINATION_TAG = 'disableApiTermination'.freeze
  CLOUD_FORMATION_TAG = 'aws:cloudformation:stack-name'.freeze
  CRITICAL_STACKS = %w[autoscale-prod test staging levelbuilder adhoc-bugcrowd]

  def initialize(instance, opts = {})
    @instance = instance
    @deletion_tag = opts[:deletion_tag]
    @minimum_time_stopped_in_seconds = opts[:minimum_time_stopped_in_seconds]
    @dry_run = opts[:dry_run]
  end

  # Method used to check if an instance can be deleted
  # The instance needs to:
  # 1) have API termination disabled
  # 2) an stack name available
  # 3) the stack name cannot be a critical stack for our infrastructure
  # 4) needs to have been stopped for an amount of days (6 default)
  def can_be_deleted?
    return api_termination_disabled? && has_stack_to_delete? && !has_critical_stack? && old_enough?
  end

  # Return true if the instance cannot be terminated with an API call.
  def api_termination_disabled?
    return @instance.describe_attribute(attribute: DISABLED_API_TERMINATION_TAG).disable_api_termination.value
  end

  # return false if there is no stack template attached to the instance.
  def has_stack_to_delete?
    return unless get_stack_name.nil?
  end

  # Return the time when the instance was tagged for deletion in seconds
  def get_stop_time_in_seconds
    stopped_at_tag = @instance.tags.find {|tag| tag.key == @deletion_tag}
    if stopped_at_tag.nil?
      return nil
    end
    return DateTime.parse(stopped_at_tag.value)
  end

  # return true if the instance has been stopped by a certain amount of days.
  # The number of minimum days is passed as an option when initialized
  def old_enough?
    stopped_at = @instance.get_stop_time_in_seconds
    if stopped_at.nil?
      return false
    end
    return (Time.now - stopped_at) > @minimum_time_stopped_in_seconds
  end

  # Get the stack name attached to an ec2 instance.
  # The stack may not exist and return nil.
  def get_stack_name
    return @instance.tags.find {|tag| tag.key == CLOUD_FORMATION_TAG}&.value
  end

  # Delete the stack attached to an instance if it meets the minimum conditions to be deleted.
  def delete
    unless @instance.can_be_deleted? && @instance.has_deletion_tag?(@deletion_tag)
      raise Error("Cannot delete instance")
    end
    unless @dry_run
      cloudformation = Aws::CloudFormation::Client.new
      cloudformation.delete_stack(stack_name: @instance.get_stack_name)
    end
  end

  # Return true if the stack attach should not be removed by the script since it is critical to code.org infrastructure
  def has_critical_stack?
    return CRITICAL_STACKS.include?(@instance.get_stack_name)
  end

  def tag_for_deletion
    unless @dry_run
      @instance.create_tags(true, {tags: [{key: @deletion_tag, value: Time.now.to_s}]})
    end
  end

  def has_deletion_tag?
    return instance.tags.any? {|tag| tag.key == @deletion_tag}
  end
end
