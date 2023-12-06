# EC2InstanceForDeletion class controls the deletion process of an EC2 instance and provides methods to evaluate
# if an instance is eligible for deletion.
#
# It includes functionalities to check if the API termination is disabled, if the instance has an associated
# stack for deletion, if the stack is critical, and if the instance has been stopped for a minimum duration.
#
# Additionally, it retrieves necessary information such as the stack name and stop time, allowing users to
# determine the eligibility of an EC2 instance for deletion based on defined criteria.
class EC2InstanceForDeletion
  # Constants defining tags and critical stacks
  DISABLED_API_TERMINATION_TAG = 'disableApiTermination'.freeze
  CLOUD_FORMATION_TAG = 'aws:cloudformation:stack-name'.freeze
  CRITICAL_STACKS = %w[autoscale-prod test staging levelbuilder adhoc-bugcrowd].freeze

  # Initialize EC2 instance and optional deletion configuration options
  def initialize(instance, deletion_tag: nil, minimum_time_stopped_in_seconds:  6 * 24 * 60 * 60, dry_run: false)
    @instance = instance
    @deletion_tag = opts[:deletion_tag]
    @minimum_time_stopped_in_seconds = opts.fetch(:minimum_time_stopped_in_seconds, 6 * 24 * 60 * 60) # Default 6 days
    @_dry_run = opts[:dry_run]
  end

  # Check if the EC2 instance is eligible for deletion
  def can_be_deleted?
    !api_termination_disabled? && has_stack_to_delete? && !has_critical_stack? && has_reached_minimum_stop_time?
  end

  private

  # Check if the instance has API termination disabled
  def api_termination_disabled?
    @instance.describe_attribute(attribute: DISABLED_API_TERMINATION_TAG).disable_api_termination.value
  end

  # Check if the attached stack is critical to infrastructure and shouldn't be removed
  def has_stack_to_delete?
    !stack_name.nil?
  end

  # Check if the instance has been stopped for a minimum period of time
  def has_critical_stack?
    CRITICAL_STACKS.include?(@instance.stack_name)
  end

  # Retrieve the time when the instance was tagged for deletion, in seconds
  def has_reached_minimum_stop_time?
    stopped_at = @instance.stop_time_in_seconds
    return false if stopped_at.nil?
    return (Time.now - stopped_at) > @minimum_time_stopped_in_seconds
  end

  # Retrieve the name of the attached stack, if any
  def stack_name
    return @instance.tags.find {|tag| tag.key == CLOUD_FORMATION_TAG}&.value
  end

  # Return the time when the instance was tagged for deletion in seconds.
  def stop_time_in_seconds
    stopped_at_tag = @instance.tags.find {|tag| tag.key == @deletion_tag}
    return nil if stopped_at_tag.nil_or_empty? || stopped_at_tag.value.nil_or_empty?
  end

  # Return instance ID as a string.
  def to_s
    return @instance.id.to_s
  end
end
